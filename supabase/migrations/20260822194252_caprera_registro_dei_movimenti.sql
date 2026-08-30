set search_path = caprera, public;

create table if not exists movimenti (
  id        bigserial primary key,
  stagione  text not null references stagioni on delete cascade,
  societa   text not null references societa  on delete cascade,
  categoria text not null check (categoria in (
              'classifiche', 'diritti-tv', 'serie-a-awards',
              'premi-caprera', 'giochi', 'penalita', 'assicurazioni')),
  voce      text not null,
  crediti   int  not null,
  fonte     text not null default 'registro Guido'
);

comment on table movimenti is
  'Il dettaglio di finanze.bonus: da dove viene ogni credito assegnato. '
  'Fonte: il registro di Guido, sei stagioni dal 2020-21.';
comment on column movimenti.categoria is
  'I sei conti del registro piu'' le assicurazioni. Un valore nuovo vuol dire '
  'che il foglio ha una voce non prevista: si guarda prima di caricarla.';
comment on column movimenti.crediti is
  'Con il segno: le penalita'' sono negative. La somma per stagione e societa'' '
  'deve fare finanze.bonus.';

create index if not exists movimenti_stagione_societa_idx
  on movimenti (stagione, societa);
create index if not exists movimenti_categoria_idx
  on movimenti (categoria);

alter table movimenti enable row level security;

drop policy if exists i_miei_movimenti on movimenti;
create policy i_miei_movimenti on movimenti
  for select using (societa = mia_societa() or sono_presidenza());

revoke select on caprera.movimenti from anon;
