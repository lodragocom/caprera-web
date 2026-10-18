// Private session connector. No cron, database credentials, or sports writes.
export const PROBE_URL='https://www.fantapazz.com/fantacalcio/formazioni-in-campo-lega/767/1/342460'
const WEEK=7*24*60*60*1000
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
const fail=code=>{const e=new Error(code);e.safeCode=code;throw e}
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')
const bytes=h=>Uint8Array.from(h.match(/.{2}/g)??[],b=>parseInt(b,16))
const keyFrom=secret=>crypto.subtle.importKey('raw',bytes(secret),{name:'AES-GCM'},false,['encrypt','decrypt'])
const configured=env=>/^[a-f0-9]{64}$/.test(env.CONTROL_TOKEN??'')&&/^[a-f0-9]{64}$/.test(env.SESSION_KEY??'')&&env.CONTROL_TOKEN!==env.SESSION_KEY
export async function authorized(request,env) {
  if (!configured(env)) return false
  const token=request.headers.get('Authorization')
  if (!/^Bearer [a-f0-9]{64}$/.test(token??'')) return false
  const encode=s=>new TextEncoder().encode(s)
  const a=new Uint8Array(await crypto.subtle.digest('SHA-256',encode(token.slice(7))))
  const b=new Uint8Array(await crypto.subtle.digest('SHA-256',encode(env.CONTROL_TOKEN)))
  return a.reduce((diff,v,i)=>diff|(v^b[i]),0)===0
}
export async function seal(value,secret) {
  const iv=crypto.getRandomValues(new Uint8Array(12)),key=await keyFrom(secret)
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('caprera:fantapazz:342460:v1')},key,new TextEncoder().encode(JSON.stringify(value)))
  return {iv:hex(iv),data:hex(new Uint8Array(encrypted))}
}
export async function unseal(value,secret) {
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(value.iv),additionalData:new TextEncoder().encode('caprera:fantapazz:342460:v1')},await keyFrom(secret),bytes(value.data))
  return JSON.parse(new TextDecoder().decode(plain))
}
export function scopeCookies(cookies,now=Date.now()) {
  const scoped=cookies.filter(c=>['fantapazz.com','.fantapazz.com','www.fantapazz.com','.www.fantapazz.com'].includes(c.domain)
    &&(c.expires===-1||c.expires*1000>now))
  if (!scoped.length||JSON.stringify(scoped).length>48000) fail('SESSIONE_NON_VALIDA')
  // Preserve only fields supported by setCookie; do not persist protocol metadata.
  return scoped.map(c=>Object.fromEntries(['name','value','domain','path','expires','httpOnly','secure','sameSite']
    .filter(k=>c[k]!==undefined).map(k=>[k,c[k]])))
}
async function body(request) {
  if (request.headers.get('Content-Type')!=='application/json') fail('JSON_RICHIESTO')
  const reader=request.body?.getReader();if(!reader)fail('JSON_RICHIESTO')
  let size=0,text='';const decoder=new TextDecoder()
  try {for (;;) {const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1024)fail('RICHIESTA_TROPPO_GRANDE');text+=decoder.decode(value,{stream:true})}}
  finally {await reader.cancel().catch(()=>{})}
  return JSON.parse(text+decoder.decode())
}
async function inspect(page) {
  if (page.url()!==PROBE_URL) fail('PAGINA_NON_ATTESA')
  const counts=await page.evaluate(()=>({
    titolo:document.title,
    incontri:[...document.querySelectorAll('#block-system-main .formazioni1vs1')].filter(e=>e.getClientRects().length).length,
    formazioni:[...document.querySelectorAll('#block-system-main .formazioni1vs1 .formazioni')].filter(e=>e.getClientRects().length).reduce((n,e)=>n+e.children.length,0),
    giocatori:[...document.querySelectorAll('#block-system-main .fic-calciatore')].filter(e=>e.getClientRects().length).length,
  }))
  if (/login|log in|access denied/i.test(counts.titolo)||counts.incontri!==5||counts.formazioni!==10||counts.giocatori<220) fail('ACCESSO_DA_RINNOVARE')
  return {incontri:counts.incontri,formazioni:counts.formazioni,giocatori:counts.giocatori}
}

export function createConnector(browserAPI) {
  class Session {
    constructor(state,env) {this.state=state;this.env=env;this.busy=false}
    async fetch(request) {
      if (!await authorized(request,this.env))return json({stato:'non_autorizzato'},401)
      const pathname=new URL(request.url).pathname
      if (!['/status','/connect','/probe','/disconnect'].includes(pathname))return json({stato:'non_trovato'},404)
      if (request.method!==(pathname==='/status'?'GET':'POST'))return json({stato:'metodo_non_ammesso'},405)
      if(this.busy)return json({stato:'occupato'},409)
      this.busy=true
      try {
        const store=this.state.storage,now=Date.now()
        let saved=await store.get('session')
        if(saved&&saved.expiresAt<=now) {await store.delete('session');saved=null}
        if(pathname==='/status')return json({stato:saved?'collegato_da_verificare':'accesso_necessario',scadenza:saved?.expiresAt??null,automatico:false,ultimo_esito:await store.get('last')??null})
        if(pathname==='/disconnect') {await store.delete('session');await store.put('last',{stato:'scollegato',al:now});return json({stato:'scollegato'})}
        if(pathname==='/connect') {
          const input=await body(request)
          if(Object.keys(input).join(',')!=='sessionId'||!/^[a-f0-9-]{36}$/.test(input.sessionId??''))fail('SESSIONE_NON_VALIDA')
          const browser=await browserAPI.connect(this.env.BROWSER,input.sessionId)
          try {
            const page=(await browser.pages()).find(p=>p.url()===PROBE_URL)
            if(!page)fail('PAGINA_NON_ATTESA')
            const counts=await inspect(page),cookies=scopeCookies(await page.cookies(PROBE_URL))
            const expiresAt=now+WEEK
            await store.put('session',{sealed:await seal(cookies,this.env.SESSION_KEY),expiresAt})
            await store.setAlarm(expiresAt)
            await store.put('last',{stato:'accesso_memorizzato',al:now,...counts})
            return json({stato:'accesso_memorizzato',scadenza:expiresAt,...counts,automatico:false})
          } finally {await browser.disconnect()}
        }
        if(!saved)fail('ACCESSO_DA_RINNOVARE')
        // Bound unattended/manual probe costs; there is no scheduled handler.
        const day=new Date(now).toISOString().slice(0,10),usage=await store.get('usage')
        const used=usage?.day===day?usage.count:0
        if(used>=3)fail('LIMITE_PROVE_GIORNALIERO')
        await store.put('usage',{day,count:used+1})
        const cookies=scopeCookies(await unseal(saved.sealed,this.env.SESSION_KEY))
        const browser=await browserAPI.launch(this.env.BROWSER,{keep_alive:60000})
        try {
          const page=await browser.newPage()
          page.setDefaultNavigationTimeout(30000);page.setDefaultTimeout(15000)
          await page.setCookie(...cookies)
          await page.goto(PROBE_URL,{waitUntil:'domcontentloaded'})
          await page.waitForSelector('#block-system-main .fic-calciatore',{timeout:15000})
          const counts=await inspect(page)
          const fresh=scopeCookies(await page.cookies(PROBE_URL))
          await store.put('session',{...saved,sealed:await seal(fresh,this.env.SESSION_KEY)})
          const outcome={stato:'accesso_riutilizzabile',al:now,...counts}
          await store.put('last',outcome)
          return json({...outcome,automatico:false})
        } finally {await browser.close()}
      } catch(e) {
        // Never include Puppeteer error text, HTML, cookie values, or stack traces.
        const code=e.safeCode??'PROVA_NON_RIUSCITA'
        await this.state.storage.put('last',{stato:'bloccato',codice:code,al:Date.now()})
        return json({stato:'bloccato',codice:code,automatico:false},422)
      } finally {this.busy=false}
    }
    async alarm() {
      const saved=await this.state.storage.get('session')
      if(saved&&saved.expiresAt<=Date.now())await this.state.storage.delete('session')
    }
  }
  return {Session,worker:{async fetch(request,env) {
    if(!configured(env))return json({stato:'da_configurare',automatico:false},503)
    if(!await authorized(request,env))return json({stato:'non_autorizzato'},401)
    return env.SESSION.getByName('lega-342460').fetch(request)
  }}}
}
