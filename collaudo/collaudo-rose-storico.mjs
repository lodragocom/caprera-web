import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {normalizza} from '../scripts/rose-storico-source.mjs'
const raw=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/rose-storico-shiny.json',import.meta.url)))
const d=normalizza(raw)
assert.equal(d.assenze.length,92)
assert.equal(d.rose.filter(r=>r.stagione==='2026-27').length,310)
assert.equal(d.assenze.find(r=>r.societa==='prosecco'&&r.nome==='Buongiorno').valore_fp,29)
assert.equal(d.assenze.find(r=>r.societa==='prosecco'&&r.nome==='Spence').valore_fp,42)
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000}})
const errors=[],privateCalls=[]
let privateFailure=false
page.on('pageerror',e=>errors.push(e.message))
const user={id:'11111111-1111-1111-1111-111111111111',email:'mister@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}}
await page.addInitScript(u=>localStorage.setItem('caprera-tessera',JSON.stringify({access_token:'test',refresh_token:'test',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,user:u})),user)
await page.route('**/*',async route=>{
 const u=new URL(route.request().url()),t=u.pathname.split('/').pop();let data=[]
 if(!u.pathname.startsWith('/rest/v1/')&&!u.pathname.startsWith('/auth/v1/'))return route.continue()
 if(u.pathname.startsWith('/auth/v1/'))data=user
 if(t==='la_mia_tessera')data={societa:'prosecco',nome:'Mister',ruolo:'mister'}
 if(t==='stagioni')data=[{id:'2026-27',ordine:11,conclusa:false}]
 if(t==='rose_sintesi_shiny')data=d.sintesi.sort((a,b)=>a.societa.localeCompare(b.societa)||a.stagione.localeCompare(b.stagione))
 if(t==='rose_storico_shiny')data=d.rose
 if(t==='rose_assenze_shiny')data=d.assenze
 if(t==='dettagli_rosa_shiny') {
  const id=route.request().postDataJSON().p_societa;privateCalls.push(id)
  if(privateFailure)return route.fulfill({status:503,json:{message:'Servizio temporaneamente non disponibile'}})
  data=id==='prosecco'?d.riservati.find(r=>r.societa===id):null
 }
 if(Array.isArray(data))for(const [k,v]of u.searchParams)if(v.startsWith('eq.'))data=data.filter(r=>String(r[k])===v.slice(3))
 if(Array.isArray(data)&&u.searchParams.has('offset'))data=data.slice(Number(u.searchParams.get('offset')),Number(u.searchParams.get('offset'))+Number(u.searchParams.get('limit')??1000))
 await route.fulfill({json:data})
})
try {
 await page.goto('http://localhost:4180/statistiche?sezione=rose-storico')
 if(await page.getByRole('button',{name:'Rifiuta tutto',exact:true}).count())await page.getByRole('button',{name:'Rifiuta tutto',exact:true}).click()
 const tabella=page.getByRole('region',{name:'Tabella rose attuali e storico'})
 await page.getByText('31 righe · 331 nell’archivio della società. Ordina premendo un’intestazione.',{exact:true}).waitFor()
 assert.equal(await tabella.locator('thead th').count(),12)
 assert.equal(await tabella.locator('tbody tr').count(),31)
 assert.deepEqual(privateCalls,[],'Pagina pubblica senza richieste contrattuali anche con sessione')
 assert.equal(await page.getByText(/Clausola Rescissoria/).count(),0)
 assert.match(await page.locator('.rose-archivio-numeri').innerText(),/229[\s\S]+375/)
 await page.getByLabel('Indicatore delle assenze',{exact:true}).selectOption('valore_fp')
 const assenti=page.getByRole('list',{name:'Indisponibili · valore_fp'})
 assert.match(await assenti.getByRole('listitem').filter({hasText:'Buongiorno'}).innerText(),/29/)
 assert.match(await assenti.getByRole('listitem').filter({hasText:'Spence'}).innerText(),/42/)
 await page.getByLabel('Stagione della rosa',{exact:true}).selectOption('2025-26')
 const fonte=d.rose.find(r=>r.societa==='prosecco'&&r.stagione==='2025-26')
 const riga=tabella.locator('tbody tr').filter({has:page.getByRole('rowheader',{name:fonte.nome,exact:true})})
 assert.equal(await riga.locator('td').nth(3).innerText(),'—','Quotazione storica mancante resta mancante')
 await page.getByLabel('Stagione della rosa',{exact:true}).selectOption('')
 await page.getByText('331 righe · 331 nell’archivio della società. Ordina premendo un’intestazione.',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Rose successive',exact:true}).click()
 assert.match(await page.locator('.rose-archivio .ana-pagine').innerText(),/2 \/ 11/)
 await page.getByLabel('Cerca nelle rose',{exact:true}).fill('Neres')
 assert.equal(await tabella.locator('tbody tr').count(),d.rose.filter(r=>r.societa==='prosecco'&&r.nome.includes('Neres')).length)
 await page.getByRole('button',{name:'Azzera filtri',exact:true}).click()
 await page.getByLabel('Società delle rose',{exact:true}).selectOption('roburro')
 await page.getByText('31 righe · 215 nell’archivio della società. Ordina premendo un’intestazione.',{exact:true}).waitFor()
 assert.equal(await page.getByLabel('Stagione della rosa',{exact:true}).locator('option').count(),8)
 await page.getByLabel('Società delle rose',{exact:true}).selectOption('prosecco')
 await page.getByText('31 righe · 331 nell’archivio della società. Ordina premendo un’intestazione.',{exact:true}).waitFor()
 await page.screenshot({path:'/tmp/caprera-rose-storico-desktop.png',fullPage:false})
 await page.setViewportSize({width:390,height:844})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Nessun overflow della pagina mobile')
 await page.screenshot({path:'/tmp/caprera-rose-storico-mobile.png',fullPage:true})
 await page.goto('http://localhost:4180/area/analisi?sezione=rose-storico')
 await page.getByRole('heading',{name:'Contratti nella Shiny · 2026-27',exact:true}).waitFor()
 assert.match(await page.locator('.rose-contratti').innerText(),/Barella/)
 await page.getByLabel('Società delle rose',{exact:true}).selectOption('roburro')
 await page.getByText('I dettagli contrattuali sono riservati al mister della società e agli incarichi abilitati.',{exact:true}).waitFor()
 assert.equal(await page.locator('.rose-contratti').count(),0)
 privateFailure=true
 await page.getByLabel('Società delle rose',{exact:true}).selectOption('prosecco')
 await page.getByRole('alert').filter({hasText:'Dettagli contrattuali non disponibili'}).waitFor()
 assert.equal(await tabella.locator('tbody tr').count(),31,'Errore privato non nasconde dati sportivi')
 assert.deepEqual(errors,[])
 console.log('OK: 3193 righe fonte, 106 totali, 12 colonne, attuale/storico, null, ricerca, pagine, Roburro, valori assenze 29/42, pubblico senza contratti, permessi simulati, errore RPC, mobile.')
}finally{await browser.close()}
