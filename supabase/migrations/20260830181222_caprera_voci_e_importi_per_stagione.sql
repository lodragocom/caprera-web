-- ============================================================================
-- Le voci si separano dai loro importi, e gli importi appartengono a una
-- stagione.
--
-- Il primo disegno aveva due difetti, tutti e due segnalati da L0:
--
-- 1. **la descrizione non era una descrizione.** Ci avevo scritto «Usata 1
--    volte, l'ultima nel 2024-25» — un metadato nel campo sbagliato. Quante
--    volte una cosa e' successa si CONTA dai movimenti, non si scrive a mano
--    in un testo che il giorno dopo e' gia' vecchio. La descrizione deve dire
--    che cos'e' quella penalita'.
--
-- 2. **un solo importo per voce e' una semplificazione falsa.** Le scale della
--    lega cambiano: il Fantapunti 2o e' stato 3 e 4, il 9o e' stato -2, -3 e
--    -4. Un catalogo che ne tiene uno solo o mente sul passato o impedisce di
--    cambiare in futuro.
--
-- Da qui la separazione: la VOCE dice cos'e' ed e' per sempre, l'IMPORTO
-- appartiene a una stagione. E' questo che rende il catalogo dinamico davvero
-- — si apre l'anno nuovo e si decide quanto vale ogni cosa, senza toccare le
-- stagioni passate.
-- ============================================================================

-- La descrizione generata era rumore: si toglie.
update caprera.voci_atto
   set descrizione = null
 where descrizione like 'Usata % volte, l%ultima nel %';

-- la vista pubblica dipende dalla colonna: si butta e si rifa' in fondo
drop view if exists public.voci_atto;
alter table caprera.voci_atto drop column if exists importo;

create table if not exists caprera.voci_atto_importo (
  voce     bigint  not null references caprera.voci_atto(id) on delete cascade,
  stagione text    not null references caprera.stagioni(id) on delete cascade,
  importo  integer not null,
  primary key (voce, stagione)
);

comment on table caprera.voci_atto_importo is
  'Quanto vale una voce in una data stagione. Le scale della lega cambiano: '
  'tenere un solo importo per voce mentirebbe sul passato o impedirebbe di '
  'cambiare in futuro.';

-- Il riempimento viene dalla storia vera: per ogni voce e ogni stagione,
-- l'importo che e' stato davvero assegnato. Dove in una stagione la stessa
-- voce ha avuto importi diversi — succede nelle classifiche, dove «Fantapunti
-- 9o» vale una cosa sola ma «FPF» vale 0 per chi non ha pagato — si prende il
-- piu' frequente.
insert into caprera.voci_atto_importo (voce, stagione, importo)
select v.id, x.stagione, x.importo
  from caprera.voci_atto v
  join lateral (
    select m.stagione, m.crediti as importo
      from caprera.movimenti m
     where m.categoria = v.categoria and m.voce = v.nome
     group by m.stagione, m.crediti
     order by m.stagione, count(*) desc, abs(m.crediti) desc
  ) x on true
on conflict do nothing;

alter table caprera.voci_atto_importo enable row level security;

create policy voci_importo_li_legge_chi_e_dentro
  on caprera.voci_atto_importo for select to authenticated using (true);

create policy voci_importo_li_scrive_il_governo
  on caprera.voci_atto_importo for all to authenticated
  using (caprera.vede_tutto()) with check (caprera.vede_tutto());


-- ---------------------------------------------------------------------------
-- Il catalogo di UNA stagione: cosa esiste, quanto vale qui, e quante volte
-- e' stato usato. L'uso si CONTA, non si scrive.
create or replace function public.catalogo_stagione(p_stagione text)
returns table (
  id bigint, categoria text, nome text, descrizione text, attiva boolean,
  importo integer, ha_importo boolean,
  usata_qui bigint, usata_sempre bigint, stagioni_usata text
)
language sql
security definer
set search_path = caprera, public, pg_temp
stable
as $$
  select v.id, v.categoria, v.nome, v.descrizione, v.attiva,
         i.importo,
         (i.voce is not null),
         (select count(*) from caprera.movimenti m
           where m.categoria = v.categoria and m.voce = v.nome and m.stagione = p_stagione),
         (select count(*) from caprera.movimenti m
           where m.categoria = v.categoria and m.voce = v.nome),
         (select string_agg(distinct m.stagione, ' ' order by m.stagione)
            from caprera.movimenti m
           where m.categoria = v.categoria and m.voce = v.nome)
    from caprera.voci_atto v
    left join caprera.voci_atto_importo i on i.voce = v.id and i.stagione = p_stagione
   order by v.categoria, v.nome;
$$;

revoke all on function public.catalogo_stagione(text) from public, anon;
grant execute on function public.catalogo_stagione(text) to authenticated;


-- Quanto vale una voce in una stagione. Un importo nullo la toglie dall'anno:
-- non tutte le voci valgono tutti gli anni, ed e' il modo di dirlo senza
-- cancellare niente.
create or replace function public.salva_importo_voce(
  p_voce bigint, p_stagione text, p_importo integer)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare n text;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' cambiare gli importi.';
  end if;
  select nome into n from caprera.voci_atto where id = p_voce;
  if n is null then
    raise exception 'Nessuna voce con questo numero.';
  end if;

  if p_importo is null then
    delete from caprera.voci_atto_importo where voce = p_voce and stagione = p_stagione;
    return format('%s non vale piu'' nel %s.', n, p_stagione);
  end if;

  insert into caprera.voci_atto_importo (voce, stagione, importo)
       values (p_voce, p_stagione, p_importo)
  on conflict (voce, stagione) do update set importo = excluded.importo;
  return format('%s nel %s: %s%s crediti.', n, p_stagione,
                case when p_importo > 0 then '+' else '' end, p_importo);
end;
$$;

revoke all on function public.salva_importo_voce(bigint, text, integer) from public, anon;
grant execute on function public.salva_importo_voce(bigint, text, integer) to authenticated;


-- La vecchia `salva_voce_atto` aveva l'importo dentro: adesso non piu'.
drop function if exists public.salva_voce_atto(bigint, text, text, integer, text, boolean, integer);

create or replace function public.salva_voce_atto(
  p_id bigint, p_categoria text, p_nome text,
  p_descrizione text default null, p_attiva boolean default true)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare n text;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' cambiare il catalogo.';
  end if;
  n := btrim(coalesce(p_nome, ''));
  if n = '' then
    raise exception 'Una voce senza nome non si salva.';
  end if;

  if p_id is null then
    insert into caprera.voci_atto (categoria, nome, descrizione, attiva)
         values (p_categoria, n, nullif(btrim(coalesce(p_descrizione,'')),''), p_attiva);
    return format('Aggiunta: %s. Adesso dille quanto vale in questa stagione.', n);
  end if;

  update caprera.voci_atto
     set categoria = p_categoria, nome = n,
         descrizione = nullif(btrim(coalesce(p_descrizione,'')),''), attiva = p_attiva
   where id = p_id;
  if not found then
    raise exception 'Nessuna voce con questo numero.';
  end if;
  return format('Aggiornata: %s.', n);
end;
$$;

revoke all on function public.salva_voce_atto(bigint, text, text, text, boolean) from public, anon;
grant execute on function public.salva_voce_atto(bigint, text, text, text, boolean) to authenticated;

drop view if exists public.voci_atto;
create view public.voci_atto as
  select id, categoria, nome, descrizione, attiva from caprera.voci_atto;
grant select on public.voci_atto to authenticated;
