-- ============================================================================
-- Il catalogo di premi e penalita' — definito, non dedotto.
--
-- Fino a ieri le voci si ricavavano da quelle gia' usate. Funziona per
-- riproporre cio' che esiste, ma non permette due cose che servono davvero:
-- **definire una penalita' prima di doverla applicare**, e **correggere un
-- importo** senza aspettare l'occasione di riusarlo.
--
-- E' il «livello 3» che lo STATO chiede al regolamento: cambio la definizione
-- e cambia il comportamento, senza toccare il codice.
--
-- ⚠️ **Cosa NON e' questa tabella.** Non e' la fonte dei premi CALCOLATI:
-- quelli — classifica fantapunti, capocannoniere — li produce
-- `v_premi_crediti` leggendo `lega.regole`, che viene dal JSON versionato. Qui
-- stanno le voci che si registrano **a mano**, cioe' gli atti di governo.
-- Tenerle separate evita di avere due verita' sullo stesso numero.
--
-- ⚠️ **L'importo e' un valore predefinito, non un vincolo.** Le scale della
-- lega cambiano nel tempo — il Fantapunti 2o e' stato 3 e 4 in stagioni
-- diverse — e un catalogo che imponesse l'importo renderebbe impossibile
-- registrare la storia com'e' andata.
-- ============================================================================

create table if not exists caprera.voci_atto (
  id          bigint generated always as identity primary key,
  categoria   text    not null,
  nome        text    not null,
  importo     integer,                    -- il valore predefinito, se ce n'e' uno
  descrizione text,
  attiva      boolean not null default true,
  ordine      integer not null default 100,
  creata      timestamptz not null default now(),
  constraint voci_atto_categoria_check check (categoria = any (array[
    'classifiche','diritti-tv','serie-a-awards','premi-caprera',
    'giochi','penalita','assicurazioni'])),
  constraint voci_atto_nome_unico unique (categoria, nome)
);

comment on table caprera.voci_atto is
  'Premi e penalita'' registrabili a mano dalla Presidenza. NON e'' la fonte dei '
  'premi calcolati: quelli stanno in lega.regole. L''importo e'' un valore '
  'predefinito, non un vincolo: le scale della lega cambiano nel tempo.';

-- Il primo riempimento viene dalle voci gia' usate, con l'importo dell'ultima
-- volta: il catalogo nasce con dentro la storia vera invece che con una lista
-- inventata, e nessuno deve ribattere sessantanove righe.
insert into caprera.voci_atto (categoria, nome, importo, descrizione)
select m.categoria, m.voce,
       (array_agg(m.crediti order by m.stagione desc))[1]::int,
       format('Usata %s volte, l''ultima nel %s.', count(*), max(m.stagione))
  from caprera.movimenti m
 where m.categoria <> 'mercato'
 group by m.categoria, m.voce
on conflict (categoria, nome) do nothing;

alter table caprera.voci_atto enable row level security;

-- Il catalogo lo legge chiunque sia entrato: un mister ha diritto di sapere
-- quali penalita' esistono, ed e' anzi il minimo. Scrivere e' della Presidenza.
create policy voci_atto_le_legge_chi_e_dentro
  on caprera.voci_atto for select to authenticated using (true);

create policy voci_atto_le_scrive_il_governo
  on caprera.voci_atto for all to authenticated
  using (caprera.vede_tutto()) with check (caprera.vede_tutto());

create or replace view public.voci_atto as
  select id, categoria, nome, importo, descrizione, attiva, ordine
    from caprera.voci_atto;

grant select on public.voci_atto to authenticated;


-- ---------------------------------------------------------------- scriverle
create or replace function public.salva_voce_atto(
  p_id bigint, p_categoria text, p_nome text,
  p_importo integer default null, p_descrizione text default null,
  p_attiva boolean default true, p_ordine integer default 100)
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
    insert into caprera.voci_atto (categoria, nome, importo, descrizione, attiva, ordine)
         values (p_categoria, n, p_importo, nullif(btrim(coalesce(p_descrizione,'')),''),
                 p_attiva, p_ordine);
    return format('Aggiunta: %s.', n);
  end if;

  update caprera.voci_atto
     set categoria = p_categoria, nome = n, importo = p_importo,
         descrizione = nullif(btrim(coalesce(p_descrizione,'')),''),
         attiva = p_attiva, ordine = p_ordine
   where id = p_id;
  if not found then
    raise exception 'Nessuna voce con questo numero.';
  end if;
  return format('Aggiornata: %s.', n);
end;
$$;

revoke all on function public.salva_voce_atto(bigint, text, text, integer, text, boolean, integer)
  from public, anon;
grant execute on function public.salva_voce_atto(bigint, text, text, integer, text, boolean, integer)
  to authenticated;


-- ---------------------------------------------------------------- ritirarle
-- Non si cancella: si mette da parte. Una voce usata in passato deve restare
-- leggibile negli atti che la citano — cancellarla renderebbe illeggibile la
-- storia per fare pulizia nel presente.
create or replace function public.ritira_voce_atto(p_id bigint, p_attiva boolean)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare v caprera.voci_atto;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' cambiare il catalogo.';
  end if;
  update caprera.voci_atto set attiva = p_attiva where id = p_id returning * into v;
  if v.id is null then
    raise exception 'Nessuna voce con questo numero.';
  end if;
  return format('%s: %s.', case when p_attiva then 'Rimessa in uso' else 'Messa da parte' end, v.nome);
end;
$$;

revoke all on function public.ritira_voce_atto(bigint, boolean) from public, anon;
grant execute on function public.ritira_voce_atto(bigint, boolean) to authenticated;
