import test from 'node:test'
import assert from 'node:assert/strict'
import { createConnector,PROBE_URL,scopeCookies,seal,unseal } from './connector.mjs'

// Deliberately public test values; production must use freshly generated secrets.
const env={CONTROL_TOKEN:'a'.repeat(64),SESSION_KEY:'b'.repeat(64),BROWSER:{}}
const cookie={name:'example_session',value:'fixture-only',domain:'.fantapazz.com',path:'/',expires:-1,httpOnly:true,secure:true,sameSite:'Lax'}
function harness({loggedIn=true,cookies=[cookie],error=false}={}) {
  const values=new Map(),calls={connect:0,launch:0,disconnect:0,close:0}
  const storage={get:async k=>values.get(k),put:async(k,v)=>{values.set(k,v)},delete:async k=>values.delete(k),setAlarm:async n=>{calls.alarm=n}}
  const page={url:()=>PROBE_URL,evaluate:async()=>({titolo:loggedIn?'Campionato - Giornata 5':'Access Denied / User log in',incontri:5,formazioni:10,giocatori:248}),
    cookies:async()=>cookies,setDefaultNavigationTimeout:()=>{},setDefaultTimeout:()=>{},setCookie:async(...c)=>{calls.restored=c},
    goto:async url=>{assert.equal(url,PROBE_URL);if(error)throw new Error('sensitive upstream text')},waitForSelector:async()=>{}}
  const browser={pages:async()=>[page],newPage:async()=>page,disconnect:async()=>{calls.disconnect++},close:async()=>{calls.close++}}
  const api={connect:async()=>{calls.connect++;return browser},launch:async()=>{calls.launch++;return browser}}
  const {Session,worker}=createConnector(api),session=new Session({storage},env)
  const request=(route,body,token=env.CONTROL_TOKEN)=>new Request(`https://connector.test${route}`,{method:route==='/status'?'GET':'POST',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
  const connect=()=>session.fetch(request('/connect',{sessionId:'11111111-1111-4111-8111-111111111111'}))
  return {values,calls,page,session,worker,request,connect}
}
test('segreti mancanti bloccano prima del browser',async()=>{const h=harness();assert.equal((await h.worker.fetch(h.request('/probe'),{})).status,503);assert.equal(h.calls.launch,0)})
test('token errato blocca connessione e lettura stato',async()=>{const h=harness();assert.equal((await h.session.fetch(h.request('/status',null,'c'.repeat(64)))).status,401);assert.equal(h.calls.connect,0)})
test('cookie cifrati e autenticati, mai restituiti',async()=>{const h=harness(),r=await h.connect();assert.equal(r.status,200);assert.ok(!JSON.stringify(h.values.get('session')).includes(cookie.value));assert.ok(!(await r.text()).includes(cookie.value));assert.deepEqual(await unseal(h.values.get('session').sealed,env.SESSION_KEY),[cookie]);assert.equal(h.calls.disconnect,1)})
test('chiave diversa non decifra',async()=>{const sealed=await seal([cookie],env.SESSION_KEY);await assert.rejects(()=>unseal(sealed,'c'.repeat(64)))})
test('conserva esclusivamente cookie Fantapazz validi',()=>{assert.deepEqual(scopeCookies([cookie,{...cookie,domain:'attacker-fantapazz.com'},{...cookie,domain:'cloudflare.com'},{...cookie,expires:1}]),[cookie])})
test('login non autenticato non viene salvato',async()=>{const h=harness({loggedIn:false});assert.equal((await h.connect()).status,422);assert.equal(h.values.has('session'),false);assert.equal(h.calls.disconnect,1)})
test('sessionId non può diventare URL arbitrario',async()=>{const h=harness();const r=await h.session.fetch(h.request('/connect',{sessionId:'https://evil.test'}));assert.equal(r.status,422);assert.equal(h.calls.connect,0)})
test('prova riparte in un browser nuovo e lo chiude',async()=>{const h=harness();await h.connect();const r=await h.session.fetch(h.request('/probe'));assert.equal((await r.json()).stato,'accesso_riutilizzabile');assert.deepEqual(h.calls.restored,[cookie]);assert.equal(h.calls.launch,1);assert.equal(h.calls.close,1)})
test('solo una prova riuscita rinnova i 30 giorni di conservazione',async()=>{
  for(const error of [false,true]) {
    const h=harness({error});await h.connect()
    const previous=Date.now()+60_000
    h.values.get('session').expiresAt=previous
    h.calls.alarm=previous
    const before=Date.now()
    await h.session.fetch(h.request('/probe'))
    const expiry=h.values.get('session').expiresAt
    if(error)assert.equal(expiry,previous)
    else {
      const ttl=30*24*60*60*1000
      assert.ok(expiry>=before+ttl&&expiry<=Date.now()+ttl)
      await h.session.alarm()
      assert.ok(h.values.has('session'),'un alarm precedente non elimina la sessione rinnovata')
    }
    assert.equal(h.calls.alarm,expiry)
  }
})
test('errore upstream non rivela segreti e chiude browser',async()=>{const h=harness({error:true});await h.connect();const r=await h.session.fetch(h.request('/probe'));assert.equal(r.status,422);assert.ok(!(await r.text()).includes('sensitive'));assert.equal(h.calls.close,1)})
test('quarto tentativo giornaliero non lancia browser',async()=>{const h=harness();await h.connect();for(let i=0;i<3;i++)await h.session.fetch(h.request('/probe'));const r=await h.session.fetch(h.request('/probe'));assert.equal((await r.json()).codice,'LIMITE_PROVE_GIORNALIERO');assert.equal(h.calls.launch,3)})
test('scadenza rimuove la credenziale e blocca il riuso',async()=>{const h=harness();await h.connect();h.values.get('session').expiresAt=Date.now()-1;const r=await h.session.fetch(h.request('/probe'));assert.equal((await r.json()).codice,'ACCESSO_DA_RINNOVARE');assert.equal(h.values.has('session'),false);assert.equal(h.calls.launch,0)})
test('disconnessione rimuove accesso senza toccare il sito',async()=>{const h=harness();await h.connect();await h.session.fetch(h.request('/disconnect'));assert.equal(h.values.has('session'),false);assert.equal(h.calls.close,0)})
test('rotte e metodi inattesi non raggiungono browser',async()=>{const h=harness();assert.equal((await h.session.fetch(h.request('/cookies'))).status,404);assert.equal((await h.session.fetch(new Request('https://connector.test/connect',{headers:{Authorization:`Bearer ${env.CONTROL_TOKEN}`}}))).status,405);assert.equal(h.calls.connect,0)})
test('corpo troppo grande rifiutato senza accesso remoto',async()=>{const h=harness();assert.equal((await h.session.fetch(h.request('/connect',{sessionId:'x'.repeat(1200)}))).status,422);assert.equal(h.calls.connect,0)})
