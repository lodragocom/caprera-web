import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const raw=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/performance-shiny.json',import.meta.url)))
const forms=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/formazioni-fantapazz-g02.json',import.meta.url)))
const ids={ARR:'armata-rossa',AVL:'aston-ville',DSP:'disperata',PRS:'prosecco',RMO:'real-monghi',ROB:'roburro',SAM:'sanguemisto',SMT:'smit',MGP:'sporting-mangiapreti',SUB:'subbuteo',NA:null}
const convert=(r,cols)=>Object.fromEntries(cols.map((k,i)=>[k,i===2?ids[r[i]]:i>=4?(r[i]===''?null:k==='giornata_serie_a'?parseInt(r[i]):Number(r[i])):r[i]]))
const perf=raw.righe.map(r=>({...convert(r,raw.colonne),stagione:'2026-27',aggiornato_al:raw.aggiornato_al})).sort((a,b)=>a.nome.localeCompare(b.nome)||a.ruolo.localeCompare(b.ruolo)||a.giornata_serie_a-b.giornata_serie_a)
const medie=raw.medie.map(r=>({...convert(r,raw.colonne_medie),stagione:'2026-27',aggiornato_al:raw.aggiornato_al}))
const match=forms.partite.find(p=>p.casa==='prosecco')
const formazione=match.formazioni.map((f,i)=>({...f,id:i+1,partita:2}))
let gid=0
const giocatori=formazione.flatMap(f=>f.giocatori.map(g=>({...g,id:++gid,formazione:f.id,calciatore:null})))
const bonus=giocatori.flatMap(g=>[...new Set(g.bonus)].map(b=>({giocatore:g.id,bonus:b,quante:g.bonus.filter(x=>x===b).length})))
const gare=[{id:2,stagione:'2026-27',societa:'prosecco',competizione:'campionato',giornata:2,giocata:true,avversario:'subbuteo',in_casa:true,gol_fatti:5,gol_subiti:0,fantapunti:88.5,fantapunti_avversario:66.5},{id:4,stagione:'2026-27',societa:'prosecco',competizione:'campionato',giornata:4,giocata:true,avversario:'armata-rossa',in_casa:false,gol_fatti:2,gol_subiti:1,fantapunti:75,fantapunti_avversario:70},{id:5,stagione:'2026-27',societa:'prosecco',competizione:'campionato',giornata:5,giocata:false,avversario:'roburro'}]
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000}})
const errors=[],offsets=[];page.on('pageerror',e=>errors.push(e.message))
const user={id:'11111111-1111-1111-1111-111111111111',email:'mister@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}}
await page.addInitScript(u=>localStorage.setItem('caprera-tessera',JSON.stringify({access_token:'test',refresh_token:'test',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,user:u})),user)
await page.route('**/*',async route=>{
 const u=new URL(route.request().url()),t=u.pathname.split('/').pop();let data=[]
 if(!u.pathname.startsWith('/rest/v1/')&&!u.pathname.startsWith('/auth/v1/'))return route.continue()
 if(u.pathname.startsWith('/auth/v1/'))data=user
 if(t==='la_mia_tessera')data={societa:'prosecco',nome:'Salvo',ruolo:'mister'}
 if(t==='stagioni')data=[{id:'2026-27',ordine:11,conclusa:false},{id:'2025-26',ordine:10,conclusa:true}]
 if(t==='performance_giocatori')data=perf
 if(t==='performance_medie')data=medie
 if(t==='v_gare')data=gare
 if(t==='formazioni')data=formazione
 if(t==='formazione_giocatori')data=giocatori
 if(t==='formazione_modificatori')data=formazione.flatMap(f=>f.modificatori.map(m=>({...m,formazione:f.id})))
 if(t==='formazione_bonus')data=bonus
 if(t==='bonus_tipi')data=[{id:'gol',nome:'Gol'},{id:'gol-subito',nome:'Gol subito'},{id:'gol-vittoria',nome:'Gol vittoria'},{id:'giallo',nome:'Ammonizione'}]
 if(Array.isArray(data))for(const [k,v]of u.searchParams){if(v.startsWith('eq.'))data=data.filter(r=>String(r[k])===v.slice(3));if(v.startsWith('in.'))data=data.filter(r=>v.slice(3).replace(/[()]/g,'').split(',').includes(String(r[k])))}
 if(u.searchParams.has('offset')){const offset=Number(u.searchParams.get('offset'));if(t==='performance_giocatori')offsets.push(offset);data=data.slice(offset,offset+Number(u.searchParams.get('limit')??1000))}
 await route.fulfill({json:data})
})
try{
 await page.goto('http://localhost:4180/area/formazioni')
 if(await page.getByRole('button',{name:'Rifiuta tutto',exact:true}).count())await page.getByRole('button',{name:'Rifiuta tutto',exact:true}).click()
 await page.getByRole('heading',{name:'In campo · 3-5-2',exact:true}).waitFor()
 assert.equal(await page.locator('button.gio.on').innerText(),'2ª')
 await page.getByText('Moreira',{exact:true}).waitFor()
 assert.match(await page.locator('.bonus-riepilogo').count()?await page.locator('.bonus-riepilogo').innerText():await page.locator('body').innerText(),/Gol/)
 const conteggio=await page.evaluate(async()=>{const {contaBonus}=await import('/src/lib/formazioni.js');return contaBonus({titolari:[{voto:7,bonus:[{id:'gol'}]}],panchina:[{voto:8,entrato:false,bonus:[{id:'gol'}]},{voto:6,entrato:true,bonus:[{id:'assist'}]}]})})
 assert.deepEqual(conteggio.map(b=>[b.id,b.n]),[['gol',1],['assist',1]])
 await page.screenshot({path:'/tmp/caprera-formazioni-giornata2.png',fullPage:true})
 await page.getByRole('button',{name:'4ª',exact:true}).click();await page.getByText('Le formazioni di questa partita non sono ancora disponibili nell’archivio.',{exact:true}).waitFor()
 await page.getByRole('button',{name:'5ª',exact:true}).click();await page.getByText(/Questa partita non è ancora stata giocata/).waitFor()
 await page.goto('http://localhost:4180/area/analisi?sezione=performance')
 await page.getByRole('heading',{name:'Performance dei giocatori · 2026-27',exact:true}).waitFor()
 await page.getByText(/3\.?255 rilevazioni · 465 calciatori/).waitFor()
 assert.deepEqual(offsets,[0,1000,2000,3000])
 for(const metrica of ['voto','fpstat','voto_round','fm','fm_round','valore_fp'])await page.getByLabel('Indicatore Performance',{exact:true}).selectOption(metrica)
 await page.getByLabel('Calciatore a confronto 1',{exact:true}).selectOption('Carnesecchi|P')
 await page.getByLabel('Cerca nelle Performance',{exact:true}).fill('Carnesecchi')
 await page.getByRole('heading',{name:'Performance medie, minimi e massimi',exact:true}).waitFor()
 await page.getByText('7 righe · i valori mancanti sono indicati con —.',{exact:true}).waitFor()
 await page.getByLabel('Alla giornata Serie A',{exact:true}).selectOption('4')
 await page.getByLabel('Dalla giornata Serie A',{exact:true}).selectOption('4')
 const sezione=page.locator('section').filter({has:page.getByRole('heading',{name:'Performance per giornata',exact:true})})
 assert.match(await sezione.innerText(),/6,5/);assert.match(await sezione.innerText(),/4,5/)
 await page.getByRole('button',{name:'Azzera filtri giocatori',exact:true}).click()
 await page.getByLabel('Società nelle Performance',{exact:true}).selectOption('prosecco')
 await page.getByLabel('Criterio Top 11 Performance',{exact:true}).selectOption('fm_mean')
 assert.equal(await page.locator('.performance-giocatori .ana-campo b').count(),11)
 await page.getByLabel('Alla giornata Serie A',{exact:true}).selectOption('7');await page.getByLabel('Dalla giornata Serie A',{exact:true}).selectOption('1')
 await page.getByLabel('Indicatore Performance',{exact:true}).selectOption('fm')
 await page.screenshot({path:'/tmp/caprera-performance.png'})
 await page.setViewportSize({width:390,height:844})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Nessun overflow orizzontale della pagina')
 await page.screenshot({path:'/tmp/caprera-performance-mobile.png'})
 await page.getByLabel('Stagione delle analisi',{exact:true}).selectOption('2025-26');await page.getByText(/Le Performance per giornata non sono ancora presenti/).waitFor()
 assert.deepEqual(errors,[])
 console.log('OK: giornata 2, sostituzioni/bonus, giornate mancanti e future, 3255 righe oltre soglia API, filtri, grafici, Top 11, mobile e stagione senza dati.')
} catch(e){console.error({errors,url:page.url(),testo:(await page.locator('body').innerText()).slice(0,5000)});throw e} finally{await browser.close()}
