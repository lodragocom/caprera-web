import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import { LAST_PLAYED_SEASON } from '../lib/core'
import {
  useArchivio, classifica, classificaFantapunti, classificaPerpetua, forma, stagioni,
} from '../lib/archivio'
import { Pagina, CorpoTabella, Riga, Numero, Sezione } from '../components/moto'
import './Classifica.css'

/**
 * La classifica, letta dall'archivio su Supabase.
 *
 * Prima questa pagina importava standings.json e lo mostrava. Adesso chiede
 * al database, e la differenza non e' solo dove stanno i dati: la classifica
 * Fantapunti non la calcola piu' il browser ordinando delle righe, la calcola
 * il database con la regola giusta - somma dei fantapunti **senza il +1 di
 * chi gioca in casa**. Ordinando in locale veniva un'altra graduatoria.
 */
const MODI = [
  ['classifica', 'Campionato'],
  ['fantapunti', 'Fantapunti'],
  ['storico', 'Storico'],
]

export default function Classifica() {
  const [stagione, setStagione] = useState(LAST_PLAYED_SEASON)
  const [modo, setModo] = useState('classifica')

  const anni = useArchivio('stagioni', stagioni)
  const camp = useArchivio(['classifica', stagione], () => classifica(stagione), [stagione])
  const fp = useArchivio(['fantapunti', stagione], () => classificaFantapunti(stagione), [stagione])
  const fo = useArchivio(['forma', stagione], () => forma(stagione), [stagione])

  // le ultime cinque giornate di ogni societa', dalla piu' recente
  const ultime = useMemo(() => {
    const m = new Map()
    for (const g of fo.dati ?? []) {
      if (!m.has(g.societa)) m.set(g.societa, [])
      m.get(g.societa).push(g)
    }
    for (const [k, v] of m) m.set(k, v.slice(-5))
    return m
  }, [fo.dati])

  const stato = modo === 'fantapunti' ? fp : camp

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Lega Caprera</p>
        <h1>Classifica</h1>
        <p className="lede">
          Tre punti per la vittoria, uno per il pareggio. A parità: differenza reti,
          gol fatti, fantapunti — come da regolamento.
        </p>
      </header>

      <div className="controls">
        <div className="seg">
          {MODI.map(([m, etichetta]) => (
            <button key={m} aria-pressed={modo === m} onClick={() => setModo(m)}>
              {etichetta}
            </button>
          ))}
        </div>

        {modo !== 'storico' && (
          <div className="field">
            <label htmlFor="stagione">Stagione</label>
            <select id="stagione" value={stagione} onChange={(e) => setStagione(e.target.value)}>
              {(anni.dati ?? []).filter((s) => s.conclusa).map((s) => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {modo === 'storico' ? <Perpetua /> : (
        <Sezione stato={stato} righe={10}>
          <div className="table-wrap">
            {modo === 'fantapunti' ? (
              <TabellaFantapunti righe={fp.dati ?? []} />
            ) : (
              <TabellaCampionato righe={camp.dati ?? []} ultime={ultime} />
            )}
          </div>
        </Sezione>
      )}

      <p className="note">
        {modo === 'fantapunti'
          ? 'Somma dei fantapunti di campionato senza il +1 di chi gioca in casa, come prevede il regolamento. È la graduatoria che decide chi va in Coppa Italia.'
          : 'Le posizioni si riferiscono al solo campionato. Coppa Italia, Champions, Europa e Conference League seguono tabelloni separati.'}
      </p>
    </Pagina>
  )
}

function TabellaCampionato({ righe, ultime }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="left">#</th><th className="left">Società</th>
          <th>G</th><th>V</th><th>N</th><th>P</th>
          <th>GF</th><th>GS</th><th>DR</th><th>FP</th><th>Pt</th>
          <th className="left form-col">Forma</th>
        </tr>
      </thead>
      <CorpoTabella>
        {righe.map((r, i) => {
          const dr = r.gol_fatti - r.gol_subiti
          return (
            <Riga key={r.societa}
                  className={i < 3 ? 'podium' : i === righe.length - 1 ? 'last' : undefined}>
              <td className="num pos">{r.posizione}</td>
              <td className="left"><TeamBadge id={r.societa} size="sm" /></td>
              <td className="num muted">{r.giocate}</td>
              <td className="num">{r.vinte}</td>
              <td className="num">{r.pari}</td>
              <td className="num">{r.perse}</td>
              <td className="num muted">{r.gol_fatti}</td>
              <td className="num muted">{r.gol_subiti}</td>
              <td className="num">{dr > 0 ? `+${dr}` : dr}</td>
              <td className="num muted"><Numero valore={r.fantapunti} decimali={1} /></td>
              <td className="num strong"><Numero valore={r.punti} /></td>
              <td className="left form-col"><Forma gare={ultime.get(r.societa)} /></td>
            </Riga>
          )
        })}
      </CorpoTabella>
    </table>
  )
}

function TabellaFantapunti({ righe }) {
  return (
    <table>
      <thead>
        <tr>
          <th className="left">#</th><th className="left">Società</th><th>Fantapunti</th>
        </tr>
      </thead>
      <CorpoTabella>
        {righe.map((r, i) => (
          <Riga key={r.societa} className={i < 3 ? 'podium' : undefined}>
            <td className="num pos">{r.posizione}</td>
            <td className="left"><TeamBadge id={r.societa} size="sm" /></td>
            <td className="num strong"><Numero valore={r.fantapunti} decimali={1} /></td>
          </Riga>
        ))}
      </CorpoTabella>
    </table>
  )
}

function Forma({ gare }) {
  if (!gare?.length) return <span className="muted">—</span>
  return (
    <span className="form">
      {gare.map((g, i) => (
        <i key={i} className={`dot dot-${g.esito}`}
           title={`${g.giornata}ª · ${g.gol_fatti}-${g.gol_subiti}`}>{g.esito}</i>
      ))}
    </span>
  )
}

/** Classifica perpetua: cento righe dal database, sommate qui. */
function Perpetua() {
  const stato = useArchivio('perpetua', classificaPerpetua)

  const righe = useMemo(() => {
    const acc = new Map()
    for (const r of stato.dati ?? []) {
      const c = acc.get(r.societa) ?? {
        societa: r.societa, stagioni: 0, giocate: 0, vinte: 0, pari: 0,
        perse: 0, gol_fatti: 0, gol_subiti: 0, punti: 0, titoli: 0,
      }
      c.stagioni += 1
      for (const k of ['giocate', 'vinte', 'pari', 'perse', 'gol_fatti', 'gol_subiti', 'punti']) {
        c[k] += r[k]
      }
      if (r.posizione === 1) c.titoli += 1
      acc.set(r.societa, c)
    }
    return [...acc.values()]
      .map((r) => ({
        ...r,
        dr: r.gol_fatti - r.gol_subiti,
        ppg: +(r.punti / r.giocate).toFixed(2),
      }))
      .sort((a, b) => b.punti - a.punti || b.dr - a.dr)
  }, [stato.dati])

  return (
    <Sezione stato={stato} righe={11}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="left">#</th><th className="left">Società</th>
              <th>St</th><th>G</th><th>V</th><th>N</th><th>P</th>
              <th>GF</th><th>GS</th><th>DR</th><th>Pt</th><th>Pt/G</th><th>Titoli</th>
            </tr>
          </thead>
          <CorpoTabella>
            {righe.map((r, i) => (
              <Riga key={r.societa} className={i < 3 ? 'podium' : undefined}>
                <td className="num pos">{i + 1}</td>
                <td className="left"><TeamBadge id={r.societa} size="sm" /></td>
                <td className="num muted">{r.stagioni}</td>
                <td className="num muted">{r.giocate}</td>
                <td className="num">{r.vinte}</td>
                <td className="num">{r.pari}</td>
                <td className="num">{r.perse}</td>
                <td className="num muted">{r.gol_fatti}</td>
                <td className="num muted">{r.gol_subiti}</td>
                <td className="num">{r.dr > 0 ? `+${r.dr}` : r.dr}</td>
                <td className="num strong"><Numero valore={r.punti} /></td>
                <td className="num muted">{r.ppg}</td>
                <td className="num gold-text">{r.titoli || '—'}</td>
              </Riga>
            ))}
          </CorpoTabella>
        </table>
      </div>
    </Sezione>
  )
}
