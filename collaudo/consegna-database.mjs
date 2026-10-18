// Solo cluster temporaneo locale dedicato; non legge .env o DSN reali.
import pg from 'pg'
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const config = { host: '/tmp', port: 55439, user: 'caprera', database: 'postgres' }
const admin = new pg.Client(config)
await admin.connect()
const nome = `consegna_test_${Date.now()}`
await admin.query(`create database ${nome}`)
const db = new pg.Client({ ...config, database: nome })
await db.connect()
const query = (sql, params) => db.query(sql, params)
let prove = 0
async function rifiuta(params, messaggio) {
  await assert.rejects(query('select public.invia_la_mia_formazione($1,$2,$3,$4,$5)', params), messaggio)
  prove++
}
const a = '11111111-1111-1111-1111-111111111111'
const b = '22222222-2222-2222-2222-222222222222'
const titolari = Array.from({ length: 11 }, (_, i) => i + 1)
try {
  await query(`do $$ begin
    if not exists (select from pg_roles where rolname='anon') then create role anon; end if;
    if not exists (select from pg_roles where rolname='authenticated') then create role authenticated; end if;
  end $$;
  create schema auth;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
  grant usage on schema auth to authenticated, anon;
  grant execute on function auth.uid() to authenticated, anon;`)
  await query(await readFile(new URL('../supabase/migrations/20260820162517_caprera_schema_archivio.sql', import.meta.url), 'utf8'))
  // La produzione ha due fotografie della rosa dal 23/08: non mescolarle.
  await query(`alter table caprera.rose add column momento text not null default 'corrente';
    alter table caprera.rose add constraint rose_momento_check check (momento in ('partenza','fine'));
    alter table caprera.rose drop constraint rose_stagione_societa_nome_key;
    alter table caprera.rose add unique (stagione,societa,momento,nome);`)
  await query(`create function caprera.mia_societa() returns text language sql stable security definer
    set search_path = '' as 'select societa from caprera.misteri where utente = auth.uid()';`)
  await query(await readFile(new URL('../supabase/migrations/20261018090000_caprera_consegna_formazioni.sql', import.meta.url), 'utf8'))
  await query(await readFile(new URL('../supabase/migrations/20261018100000_caprera_bozze_formazione.sql', import.meta.url), 'utf8'))
  await query(`insert into auth.users values ($1),($2)`, [a, b])
  await query(`insert into caprera.lega(id,nome,dal,regole) values ('caprera','Lega',2016,$1)`, [JSON.stringify({ campo: { moduli_ammessi: ['3-4-3','4-4-2'], panchinari: 15 } })])
  await query(`insert into caprera.stagioni(id,lega,ordine) values ('2026-27','caprera',11);
    insert into caprera.societa(id,lega,nome,breve,sigla,colore) values
    ('a','caprera','A','A','A','navy'),('b','caprera','B','B','B','gold');
    insert into caprera.partecipazioni values ('2026-27','a'),('2026-27','b');`)
  await query(`insert into caprera.misteri(utente,societa) values ($1,'a'),($2,'b')`, [a,b])
  const ruoli = ['P','D','D','D','C','C','C','C','A','A','A','P','D']
  for (const s of ['a','b']) for (let i = 0; i < ruoli.length; i++) {
    await query('insert into caprera.rose(stagione,societa,nome,ruolo) values ($1,$2,$3,$4)', ['2026-27',s,`Giocatore ${i}`,ruoli[i]])
  }
  await query(`insert into caprera.rose(stagione,societa,nome,ruolo,momento)
    values ('2026-27','a','Giocatore 0','P','partenza')`)
  await query(`insert into caprera.turni_consegna(stagione,giornata,scadenza,aperto)
    values ('2026-27',1,now()+interval '1 hour',true),('2026-27',2,now()-interval '1 hour',true)`)
  await query('select set_config($1,$2,false)', ['request.jwt.claim.sub',a])
  await query('set role authenticated')
  const contesto = (await query('select public.la_mia_consegna() as d')).rows[0].d
  assert.equal(contesto.rosa.length, 13)
  assert.equal(contesto.societa, 'a')
  const salva = async (rev) => (await query('select public.invia_la_mia_formazione($1,$2,$3,$4,$5) as d', [1,'3-4-3',titolari,[13,12],rev])).rows[0].d
  assert.equal((await salva(0)).revisione, 1); prove++
  assert.deepEqual((await salva(1)).panchina, [13,12]); prove++
  await rifiuta([1,'3-4-3',titolari,[12],1], /altro dispositivo/)
  await rifiuta([1,'4-4-2',titolari,[],2], /ruoli/)
  await rifiuta([1,'4-2-4',titolari,[],2], /Modulo/)
  await rifiuta([1,'3-4-3',titolari,[1],2], /più volte/)
  await rifiuta([1,'3-4-3',titolari,[27],2], /tua rosa/)
  await rifiuta([1,'3-4-3',[...titolari.slice(0,10),24],[],2], /tua rosa/)
  await rifiuta([1,'3-4-3',titolari.slice(0,10),[],2], /11 titolari/)
  await rifiuta([2,'3-4-3',titolari,[],0], /chiusa/)
  const bozza = (await query('select public.salva_la_mia_bozza($1,$2,$3,$4,$5) as d', ['2026-27','3-4-3',titolari,[13,12],0])).rows[0].d
  assert.equal(bozza.revisione,1); prove++
  await assert.rejects(query('select public.salva_la_mia_bozza($1,$2,$3,$4,$5)', ['2026-27','3-4-3',titolari,[12],0]), /altro dispositivo/); prove++
  assert.deepEqual((await query('select public.la_mia_consegna() as d')).rows[0].d.bozza.panchina,[13,12]); prove++
  await assert.rejects(query(`select * from caprera.consegne_formazione`), /permission denied/); prove++
  await query('reset role')
  await query('select set_config($1,$2,false)', ['request.jwt.claim.sub',b])
  await query('set role authenticated')
  assert.equal((await query('select public.la_mia_consegna() as d')).rows[0].d.consegna, null); prove++
  assert.equal((await query('select public.la_mia_consegna() as d')).rows[0].d.bozza, null); prove++
  await assert.rejects(query('select public.salva_la_mia_bozza($1,$2,$3,$4,$5)', ['2026-27','3-4-3',titolari,[],0]), /tua rosa/); prove++
  await rifiuta([1,'3-4-3',titolari,[],0], /tua rosa/)
  await query('reset role')
  await query('set role anon')
  await assert.rejects(query('select public.la_mia_consegna()'), /permission denied/); prove++
  await assert.rejects(query('select public.salva_la_mia_bozza($1,$2,$3,$4,$5)', ['2026-27','3-4-3',titolari,[],0]), /permission denied/); prove++
  await query('reset role')
  await query(`update caprera.turni_consegna set aperto=false`)
  await query('select set_config($1,$2,false)', ['request.jwt.claim.sub',a])
  await query('set role authenticated')
  const preparazione = (await query('select public.la_mia_consegna() as d')).rows[0].d
  assert.equal(preparazione.turno,null)
  assert.equal(preparazione.stagione,'2026-27')
  assert.equal(preparazione.rosa.length,13)
  assert.equal(preparazione.bozza.revisione,1); prove++
  await query('reset role')
  assert.equal((await query('select count(*)::int n from caprera.formazioni')).rows[0].n, 0)
  assert.equal((await query('select count(*)::int n from caprera.consegne_formazione')).rows[0].n, 1)
  console.log(`Database: ${prove} prove superate; archivio storico invariato.`)
} finally {
  await db.end()
  await admin.query(`drop database ${nome}`)
  await admin.end()
}
