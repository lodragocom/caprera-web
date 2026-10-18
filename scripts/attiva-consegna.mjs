/** Attivazione additiva: nessuna cancellazione o aggiornamento dello storico.
 * node scripts/attiva-consegna.mjs <import.json> [--applica]
 * Senza --applica verifica tutto e annulla la transazione.
 * Il JSON contiene solo la rosa estratta dall'export fornito dalla Presidenza.
 */
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const file = process.argv[2]
if (!file) throw new Error('Indica il JSON delle rose verificate.')
const fonte = JSON.parse(await fs.readFile(file, 'utf8'))
assert.equal(fonte.stagione, '2026-27')
assert.equal(fonte.momento, 'corrente')
assert.equal(fonte.rose.length, 310)
assert.equal(new Set(fonte.rose.map((r) => r.societa)).size, 10)
assert.equal(new Set(fonte.rose.map((r) => `${r.societa}/${r.nome}`)).size, 310)
const sql = await fs.readFile(new URL('../supabase/migrations/20261018090000_caprera_consegna_formazioni.sql', import.meta.url), 'utf8')
const letterale = (v) => v == null ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replaceAll("'", "''")}'`
const caricamento = [`-- Export Fantapazz ${fonte.lega_fantapazz}; SHA256 ${fonte.sha256}`]
const db = new pg.Client({ connectionString: (await fs.readFile(path.join(os.homedir(), '.caprera-dsn'), 'utf8')).trim(), connectionTimeoutMillis: 10000 })
const storico = ['partite', 'formazioni', 'formazione_giocatori', 'formazione_bonus', 'formazione_modificatori', 'contratti', 'finanze', 'movimenti', 'classifiche', 'calciatori', 'calciatori_nomi', 'lega']
async function impronta() {
  const valori = {}
  for (const tabella of [...storico, 'rose', 'partecipazioni']) {
    const where = ['rose','partecipazioni'].includes(tabella) ? " where stagione <> '2026-27'" : ''
    valori[tabella] = (await db.query(`select count(*)::int n,
      md5(coalesce(string_agg(md5(to_jsonb(r)::text),'' order by md5(to_jsonb(r)::text)),'')) hash
      from caprera.${tabella} r${where}`)).rows[0]
  }
  return valori
}
try {
  await db.connect()
  await db.query('begin')
  await db.query("select pg_advisory_xact_lock(hashtext('caprera-attiva-consegna-20261018'))")
  await db.query("set local lock_timeout = '5s'")
  const prima = await impronta()
  assert.equal((await db.query("select conclusa from caprera.stagioni where id=$1 and lega='caprera'",[fonte.stagione])).rows[0]?.conclusa, false)
  assert.equal((await db.query("select count(*)::int n from caprera.rose where stagione=$1",[fonte.stagione])).rows[0].n,0,'La stagione ha già una rosa: fermarsi prima di scrivere.')
  assert.equal((await db.query("select to_regclass('caprera.turni_consegna') t")).rows[0].t,null,'La migrazione risulta già applicata.')
  // Le transazioni si gestiscono qui, insieme al caricamento e al registro.
  await db.query(sql.replace(/^begin;$/m,'').replace(/^commit;$/m,''))
  let agganciati = 0
  for (const societa of new Set(fonte.rose.map((r) => r.societa))) {
    assert.equal((await db.query("select count(*)::int n from caprera.societa where id=$1 and lega='caprera'",[societa])).rows[0].n,1)
    const squadra = fonte.rose.filter((r) => r.societa === societa)
    for (const [ruolo,n] of Object.entries({P:6,D:9,C:9,A:7})) assert.equal(squadra.filter((r)=>r.ruolo===ruolo).length,n)
    await db.query('insert into caprera.partecipazioni(stagione,societa) values ($1,$2) on conflict do nothing',[fonte.stagione,societa])
    caricamento.push(`insert into caprera.partecipazioni(stagione,societa) values (${letterale(fonte.stagione)},${letterale(societa)}) on conflict do nothing;`)
  }
  for (const r of fonte.rose) {
    assert.ok(r.nome && ['P','D','C','A'].includes(r.ruolo) && Number.isInteger(r.costo) && r.costo >= 0)
    const candidati = (await db.query(`select distinct c.id from caprera.calciatori c
      left join caprera.calciatori_nomi n on n.calciatore=c.id
      where c.ruolo=$2 and (lower(c.nome)=lower($1) or lower(n.nome)=lower($1))`,[r.nome,r.ruolo])).rows
    const calciatore = candidati.length===1 ? candidati[0].id : null
    if(calciatore) agganciati++
    const valori = [fonte.stagione,r.societa,r.nome,r.ruolo,r.club,r.costo,'corrente',
      `Fantapazz ${fonte.lega_fantapazz}, export 18/10/2026, sha256 ${fonte.sha256}`,calciatore]
    const inserimento = `insert into caprera.rose(stagione,societa,nome,ruolo,club,costo,momento,fonte,calciatore) values (${valori.map(letterale).join(',')});`
    await db.query(inserimento)
    caricamento.push(inserimento)
  }
  assert.deepEqual(await impronta(),prima,'Lo storico deve rimanere identico.')
  for (const tabella of ['turni_consegna','consegne_formazione']) {
    assert.equal((await db.query(`select has_table_privilege('anon',$1,'select') a,has_table_privilege('authenticated',$1,'insert') b`,[`caprera.${tabella}`])).rows.some((r)=>r.a||r.b),false)
  }
  assert.equal((await db.query("select has_function_privilege('anon','public.la_mia_consegna(bigint)','execute') a")).rows[0].a,false)
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements)
    values ('20261018090000','caprera_consegna_formazioni',$1)`,[[sql]])
  const datiSql = caricamento.join('\n')+'\n'
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements)
    values ('20261018093000','caprera_rose_correnti_2026_27',$1)`,[[datiSql]])
  if (process.argv.includes('--applica')) {
    await fs.writeFile(new URL('../supabase/migrations/20261018093000_caprera_rose_correnti_2026_27.sql',import.meta.url),datiSql)
    await db.query('commit')
    console.log(JSON.stringify({stato:'attivato',rosa:310,societa:10,agganciati,da_agganciare:310-agganciati,storico:'identico',turni:'nessuno inventato'}))
  } else {
    await db.query('rollback')
    console.log(JSON.stringify({stato:'verifica_superata_rollback',rosa:310,societa:10,agganciati,storico:'identico'}))
  }
} catch(e) {
  await db.query('rollback').catch(()=>{})
  console.error(e.message)
  process.exitCode=1
} finally { await db.end() }
