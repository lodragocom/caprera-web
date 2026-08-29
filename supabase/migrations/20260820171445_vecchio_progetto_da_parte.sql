-- Il vecchio progetto (collegamento a una banca dati di calcio italiano per
-- voti e quotazioni) va tolto di mezzo: l'archivio buono ora sta in 'caprera'
-- e per i voti si usa Fantapazz, che li da' gia' insieme al costo in crediti.
--
-- Non si cancella: si sposta. Sparisce da 'public' e quindi dall'API e dal
-- Table Editor, ma resta li' finche' Salvo non dice di buttarlo davvero.
-- Sono 4.300 righe di lavoro di qualcuno: meritano una rete.
create schema if not exists vecchio_progetto;

do $$
declare r record;
begin
  -- prima le viste, che dipendono dalle tabelle
  for r in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
            where n.nspname='public' and c.relkind='v'
  loop
    execute format('alter view public.%I set schema vecchio_progetto', r.relname);
  end loop;

  for r in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
            where n.nspname='public' and c.relkind='r'
  loop
    execute format('alter table public.%I set schema vecchio_progetto', r.relname);
  end loop;
end $$;

-- Fuori dall'API: lo schema non e' esposto, ma meglio dirlo anche qui.
revoke all on schema vecchio_progetto from anon, authenticated;

comment on schema vecchio_progetto is
  'Primo tentativo (settembre 2025): abbinamento dei calciatori con una API di '
  'calcio esterna, piu'' sei utenti di prova. Messo da parte il 20 agosto 2026, '
  'non cancellato. Per buttarlo davvero: drop schema vecchio_progetto cascade;';
