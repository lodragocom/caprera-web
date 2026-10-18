import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {gareSocieta,aggregaCampionato} from '../src/lib/analisi.js'
const source=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/rose-correnti-import.json',import.meta.url)))
const sourceQuote=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/listone-corrente-import.json',import.meta.url)))
const sourceStats=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/statistiche-giornata-shiny.json',import.meta.url)))
const sql=await fs.readFile(new URL('../supabase/migrations/20261018110000_caprera_stagione_corrente_shiny.sql',import.meta.url),'utf8')
const ids={ARR:'armata-rossa',AVL:'aston-ville',DSP:'disperata',PRS:'prosecco',RMO:'real-monghi',ROB:'roburro',SAM:'sanguemisto',SMT:'smit',MGP:'sporting-mangiapreti',SUB:'subbuteo'}
const gare=[...sql.matchAll(/\('2026-27','campionato',(\d+),'([^']+)','([^']+)',([\d.]+),([\d.]+),([\d.]+),([\d.]+),true\)/g)].map((m,i)=>({id:i+1,giornata:Number(m[1]),casa:m[2],fuori:m[3],gol_casa:Number(m[4]),gol_fuori:Number(m[5]),fp_casa:Number(m[6]),fp_fuori:Number(m[7]),giocata:true}))
assert.equal(gare.length,20)
gare.push({id:21,giornata:5,casa:'prosecco',fuori:'roburro',giocata:false})
for(const g of gare)g.stagione='2026-27'
const classe=aggregaCampionato(gareSocieta(gare)).map((r,i)=>({...r,stagione:'2026-27',posizione:i+1}))
assert.equal(classe.find(r=>r.societa==='prosecco').fantapunti,294.5)
const medie=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/medie-rose-shiny.json',import.meta.url)))
const nomiQuote=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/quotazioni-rose-shiny.json',import.meta.url)))
const rose=source.rose.map((r,i)=>({...r,id:i+1,calciatore:null,stagione:'2026-27',momento:'corrente',presenze:null,mv:null,fm:null}))
for(const s of nomiQuote.rose)for(const [i,[nome]]of s.righe.entries()){const r=rose.find(r=>r.nome===nome&&r.societa===s.societa);[r.presenze,r.mv,r.fm]=medie.rose[s.societa][i]}
const quote=sourceQuote.righe.map(r=>({...r,stagione:'2026-27',momento:'fine'}))
const stats=sourceStats.giornate.flatMap(g=>g.righe.map(([id,fantapunti,valore_rosa,fair_play,panchina_oro,zdenek])=>({stagione:'2026-27',societa:ids[id],giornata:g.giornata,fantapunti,valore_rosa,fair_play,panchina_oro,zdenek})))
const browser=await chromium.launch(),p=await browser.newPage({viewport:{width:1440,height:1000}})
const errori=[];p.on('pageerror',e=>errori.push(e.message))
const user={id:'11111111-1111-1111-1111-111111111111',email:'mister@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}}
await p.addInitScript(u=>localStorage.setItem('caprera-tessera',JSON.stringify({access_token:'test',refresh_token:'test',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,user:u})),user)
await p.route('**/*',async route=>{const u=new URL(route.request().url());if(!u.pathname.startsWith('/rest/v1/')&&!u.pathname.startsWith('/auth/v1/'))return route.continue();let data=[];const t=u.pathname.split('/').pop();if(u.pathname.startsWith('/auth/'))data=user;if(t==='la_mia_tessera')data={societa:'prosecco',nome:'Mister',ruolo:'mister'};if(t==='la_mia_consegna')data={societa:'prosecco',stagione:'2026-27',turno:null,bozza:null,rosa:rose.filter(r=>r.societa==='prosecco')};if(t==='stagioni')data=[{id:'2026-27',ordine:11,conclusa:false,giornate:36},{id:'2025-26',ordine:10,conclusa:true,giornate:36}];if(t==='partite')data=gare;if(t==='classifiche')data=classe;if(t==='rose')data=rose;if(t==='listone')data=quote;if(t==='statistiche_giornata')data=stats;for(const k of ['stagione','societa','momento']){const v=u.searchParams.get(k);if(Array.isArray(data)&&v?.startsWith('eq.'))data=data.filter(r=>r[k]===v.slice(3));if(Array.isArray(data)&&v?.startsWith('in.'))data=data.filter(r=>v.slice(4,-1).split(',').includes(r[k]))}await route.fulfill({json:data})})
try{
 await p.goto('http://localhost:4180/area');if(await p.getByRole('button',{name:'Rifiuta tutto',exact:true}).count())await p.getByRole('button',{name:'Rifiuta tutto',exact:true}).click()
 await p.getByRole('heading',{name:'La stagione, giornata per giornata',exact:true}).waitFor()
 await p.getByRole('link',{name:'Schiera formazione',exact:true}).last().waitFor()
 await p.getByText('Roburro',{exact:true}).first().waitFor()
 await p.locator('.pan-stagione-kpi').getByText('375',{exact:true}).waitFor()
 assert.equal(await p.locator('iframe').count(),0)
 await p.screenshot({path:'/tmp/caprera-panoramica-nuova.png',fullPage:true});await p.screenshot({path:'/tmp/caprera-panoramica-anteprima.png'})
 await p.goto('http://localhost:4180/area/analisi')
 await p.getByLabel('Indicatore',{exact:true}).selectOption('fair_play')
 await p.getByRole('heading',{name:'Fair Play nell’intervallo'}).waitFor()
 await p.getByRole('button',{name:'Rose e valori',exact:true}).click();await p.getByRole('heading',{name:'Costo e valore',exact:true}).waitFor()
 await p.getByLabel('Società',{exact:true}).selectOption('prosecco');await p.getByText('229',{exact:true}).first().waitFor()
 await p.getByRole('button',{name:'Giocatori e svincolati',exact:true}).click();await p.getByText(/616 risultati/).waitFor();await p.getByText(/disponibili per 265 giocatori/).waitFor();await p.getByLabel('Criterio Top 11',{exact:true}).selectOption('fm');await p.getByText(/Media degli undici/).waitFor()
 await p.getByLabel('Disponibilità',{exact:true}).selectOption('svincolati');await p.getByText(/306 risultati/).waitFor()
 await p.getByLabel('Cerca',{exact:true}).fill('Pisseri');await p.getByText('Pisseri',{exact:true}).first().waitFor();await p.getByText(/1 risultati/).waitFor()
 await p.getByRole('button',{name:'Scontri diretti',exact:true}).click();await p.getByLabel('Seconda società',{exact:true}).selectOption('roburro');await p.getByText(/Prossimo incontro: 5ª/).waitFor()
 await p.getByRole('button',{name:'Storico',exact:true}).click();await p.getByRole('heading',{name:'Archivio delle stagioni',exact:true}).waitFor()
 await p.goto('http://localhost:4180/statistiche');await p.getByRole('heading',{name:'Statistiche della lega',exact:true}).waitFor();await p.getByRole('img',{name:/Andamento Punti/}).waitFor();assert.equal(await p.locator('iframe').count(),0)
 await p.getByLabel('Campo',{exact:true}).selectOption('casa');await p.getByRole('heading',{name:'Classifica nell’intervallo',exact:true}).waitFor()
 await p.getByLabel('Stagione delle analisi',{exact:true}).selectOption('2025-26');await p.getByLabel('Stagione delle analisi',{exact:true}).selectOption('2026-27')
 await p.setViewportSize({width:390,height:844});await p.goto('http://localhost:4180/area');await p.getByRole('heading',{name:'La stagione, giornata per giornata',exact:true}).waitFor()
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'La pagina mobile non deve scorrere orizzontalmente')
 await p.screenshot({path:'/tmp/caprera-panoramica-mobile.png',fullPage:true})
 assert.deepEqual(errori,[])
 console.log('Panoramica, grafici, intervalli, Fair Play, rose, 616 giocatori, 306 svincolati, scontri, storico e mobile: OK.')
}catch(e){console.log({errori,url:p.url(),testo:(await p.locator('body').innerText()).slice(0,10000)});throw e}finally{await browser.close()}
