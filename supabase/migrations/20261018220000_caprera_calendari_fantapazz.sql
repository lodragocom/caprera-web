-- Calendari e classifiche sportive; fonte originale nel repository privato.
create table caprera.calendari_fantapazz (
 stagione text primary key references caprera.stagioni(id),
 acquisito_al date not null,
 fonte_sha256 text not null check(length(fonte_sha256)=64),
 calendari jsonb not null check(jsonb_typeof(calendari)='array'),
 classifiche jsonb not null check(jsonb_typeof(classifiche)='array')
);
alter table caprera.calendari_fantapazz enable row level security;
create policy lettura_sportiva on caprera.calendari_fantapazz for select using(true);
grant select on caprera.calendari_fantapazz to anon,authenticated;
create view public.calendari_fantapazz with(security_invoker=true) as
 select stagione,acquisito_al,fonte_sha256,calendari,classifiche from caprera.calendari_fantapazz;
grant select on public.calendari_fantapazz to anon,authenticated;
