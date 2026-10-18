import assert from 'node:assert/strict'

export const colonne = ['nome','stagione','ruolo','costo','valore_fp','club','mv','presenze','fm_fp','mv_fp','fm_ro_fp','mv_ro_fp']
const numero = s => {
  if (s === '') return null
  const n = Number(s)
  assert.ok(Number.isFinite(n), `Numero non valido: ${s}`)
  return n
}
export function normalizza(source) {
  assert.equal(source.rose.length, 10)
  assert.equal(new Set(source.rose.map(s => s.societa)).size, 10)
  const rose = [], assenze = [], sintesi = [], riservati = []
  for (const s of source.rose) {
    const comuni = { societa:s.societa, aggiornato_al:source.aggiornato_al }
    const righe = s.righe.map((r,i) => {
      assert.equal(r.length, 12)
      assert.match(r[1], /^\d{2}-\d{2}$/)
      assert.match(r[2], /^[PDCA]$/)
      return {...Object.fromEntries(colonne.map((k,j) => [k, j===1 ? `20${r[j]}` : [0,2,5].includes(j) ? r[j] : numero(r[j])])), ...comuni, ordine:i+1}
    })
    assert.equal(righe.filter(r=>r.stagione==='2026-27').length,31)
    assert.equal(new Set(righe.map(r=>`${r.stagione}|${r.nome}|${r.ruolo}`)).size,righe.length)
    rose.push(...righe)
    const riepilogo = s.riepilogo.match(/Costo Rosa:([\s\S]+)Valore FP Rosa:([\s\S]+)Wage Rosa:([\s\S]+)/)
    assert.ok(riepilogo)
    const valori = text => [...text.matchAll(/(20\d{2}-\d{2}):\s*([\d.]+)/g)].map(m=>[m[1],numero(m[2])])
    const quote = new Map(valori(riepilogo[2]))
    for (const [stagione,costo] of valori(riepilogo[1])) {
      const annata = righe.filter(r=>r.stagione===stagione)
      assert.equal(annata.reduce((n,r)=>n+r.costo,0),costo,`${s.societa} ${stagione}: costo`)
      if (quote.has(stagione)) assert.equal(annata.reduce((n,r)=>n+r.valore_fp,0),quote.get(stagione))
      sintesi.push({...comuni,stagione,costo,valore_fp:quote.get(stagione)??null,giocatori:annata.length})
    }
    const metriche = [['Count','conteggio'],['Costo','costo'],['Valore FP','valore_fp']]
    const entries = new Map()
    for (const [etichetta,campo] of metriche) {
      const viste = new Set()
      for (const testo of s.assenze[etichetta]) {
        const m = testo.match(new RegExp(`^Calciatore: (.+)${etichetta}:\\s*([\\d.]+)Ragione: (Indisponibili|Assenti|Squalificati)$`))
        assert.ok(m,`Tooltip non riconosciuto: ${testo}`)
        const key = `${m[1]}|${m[3]}`
        assert.ok(!viste.has(key)); viste.add(key)
        if (!entries.has(key)) entries.set(key,{...comuni,stagione:'2026-27',nome:m[1],ragione:m[3]})
        entries.get(key)[campo]=numero(m[2])
      }
    }
    for (const r of entries.values()) {
      assert.ok(metriche.every(([,k])=>Number.isFinite(r[k])))
      assert.ok(righe.some(p=>p.stagione==='2026-27'&&p.nome===r.nome))
      assenze.push(r)
    }
    const wage = valori(riepilogo[3])
    assert.equal(wage.length,1)
    riservati.push({...comuni,stagione:wage[0][0],wage:wage[0][1],contratti:s.contratti})
  }
  assert.equal(rose.length,3193)
  return {rose,assenze,sintesi,riservati}
}
