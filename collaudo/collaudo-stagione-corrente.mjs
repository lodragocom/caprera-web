import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const browser=await chromium.launch()
const p=await browser.newPage({viewport:{width:1300,height:1000}})
const errori=[]
p.on('pageerror',e=>errori.push(e.message))
const user={id:'11111111-1111-1111-1111-111111111111',email:'mister@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}}
await p.addInitScript(u=>localStorage.setItem('caprera-tessera',JSON.stringify({access_token:'test',refresh_token:'test',token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+3600,user:u})),user)
const fonte=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/rose-correnti-import.json',import.meta.url),'utf8'))
const nomeGiocatore=fonte.rose.find(r=>r.societa==='prosecco').nome
const rose=fonte.rose.map((r,i)=>({...r,id:i+1,calciatore:null,stagione:'2026-27',momento:'corrente',fonte:'Fantapazz',presenze:null,mv:null,fm:null}))
const storia=[{id:999,calciatore:null,societa:'prosecco',stagione:'2025-26',momento:'fine',nome:'Storico 2025',ruolo:'P',costo:1}]
await p.route('**/*',async route=>{
  const u=new URL(route.request().url())
  if(!u.pathname.startsWith('/rest/v1/')&&!u.pathname.startsWith('/auth/v1/')) return route.continue()
  let data=[]
  const tab=u.pathname.split('/').pop()
  if(u.pathname.startsWith('/auth/'))data=user
  if(tab==='la_mia_tessera')data={societa:'prosecco',nome:'Mister',ruolo:'mister'}
  if(tab==='stagioni')data=[{id:'2026-27',ordine:11,conclusa:false,giornate:36},{id:'2025-26',ordine:10,conclusa:true,giornate:36}]
  if(tab==='rose_momenti')data=[{stagione:'2026-27',momento:'corrente',fonte:'Fantapazz'},{stagione:'2025-26',momento:'fine',fonte:'foglio'}]
  if(tab==='finanze_mie')data=[{stagione:'2026-27',societa:'prosecco',iniziali:262,spesi:229,scambi:null,residui:null,riportati:1,bonus:13,ffp:0,base:250,assicurazione:-2}]
  if(tab==='rose'){
    data=[...rose,...storia]
    for(const k of ['stagione','momento','societa']){
      const v=u.searchParams.get(k)
      if(v?.startsWith('eq.'))data=data.filter(r=>r[k]===v.slice(3))
      if(v?.startsWith('in.'))data=data.filter(r=>v.slice(4,-1).split(',').includes(r[k]))
    }
  }
  await route.fulfill({json:data})
})
try {
  await p.goto('http://localhost:4180/area/rosa')
  await p.getByRole('button',{name:'Rifiuta tutto',exact:true}).click()
  await p.locator('.ro-stagione select').waitFor()
  await p.waitForFunction(()=>document.querySelector('.ro-stagione select')?.value==='2026-27')
  await p.getByText(nomeGiocatore,{exact:true}).first().waitFor()
  assert.equal(await p.getByText('Storico 2025',{exact:true}).count(),0)
  await p.locator('.ro-stagione select').selectOption('2025-26')
  await p.getByText('Storico 2025',{exact:true}).first().waitFor()
  await p.locator('.ro-stagione select').selectOption('2026-27')
  await p.getByText(nomeGiocatore,{exact:true}).first().waitFor()
  for(const pagina of ['rose','classifica','risultati']){
    await p.goto(`http://localhost:4180/${pagina}`)
    await p.waitForFunction(()=>Array.from(document.querySelectorAll('select')).some(s=>s.value==='2026-27'))
  }
  await p.goto('http://localhost:4180/area')
  await p.getByText('Area mister · 2026-27',{exact:true}).waitFor()
  await p.goto('http://localhost:4180/area/crediti')
  await p.locator('.kpi-row').getByText('229',{exact:true}).waitFor()
  await p.getByText(/Il saldo residuo non è ancora disponibile nella fonte/).waitFor()
  assert.equal(await p.getByText('Quello che resterebbe',{exact:true}).count(),0,'Scambi sconosciuti non devono diventare zero nel saldo')
  assert.deepEqual(errori,[])
  await p.goto('http://localhost:4180/area/rosa')
  await p.getByText(nomeGiocatore,{exact:true}).first().waitFor()
  await p.screenshot({path:'/tmp/caprera-rosa-2026-27.png',fullPage:true})
  console.log('2026-27: rosa privata corrente, archivio selezionabile, rose pubbliche, classifica, risultati e panoramica OK.')
}catch(e){console.log(errori);console.log((await p.locator('body').innerText()).slice(0,7000));throw e}finally{await browser.close()}
