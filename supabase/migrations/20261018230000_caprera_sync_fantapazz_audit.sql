-- Registro privato degli aggiornamenti sportivi; nessuna vista pubblica.
create table caprera.sync_fantapazz_audit (
  id bigint generated always as identity primary key,
  stagione text not null references caprera.stagioni(id),
  fonte_sha256 text not null check(fonte_sha256 ~ '^[0-9a-f]{64}$'),
  precedente_sha256 text not null check(precedente_sha256 ~ '^[0-9a-f]{64}$'),
  acquisito_al timestamptz not null,
  applicato_al timestamptz not null default now(),
  prima jsonb not null,
  dopo jsonb not null,
  rapporto jsonb not null,
  unique(stagione,fonte_sha256)
);
alter table caprera.sync_fantapazz_audit enable row level security;
revoke all on caprera.sync_fantapazz_audit from public,anon,authenticated;
