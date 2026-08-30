import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeam, logoUrl, LAST_PLAYED_SEASON } from '../lib/core'
import {
  useArchivio, classifica, classificaFantapunti, classificaPerpetua, forma, stagioni,
} from '../lib/archivio'
import { Pagina, CorpoTabella, Riga, Numero, Sezione } from '../components/moto'
import './Classifica.css'

/**
 * La classifica, letta dall'archivio su Supabase.
 *
 * La classifica Fantapunti non la calcola il browser ordinando delle righe: la
 * calcola il database con la regola giusta — somma dei fantapunti **senza il
 * +1 di chi gioca in casa**. Ordinando in locale veniva un'altra graduatoria.
 *
 * Qui si può riordinare per qualunque colonna. È una cosa diversa: cambia solo
 * come si guardano le stesse righe, non chi è primo. La posizione resta quella
 * vera del campionato anche quando si ordina per gol fatti, altrimenti si
 * finisce col credere che chi segna di più stia vincendo.
 */
const MODI = [
  ['classifica', 'Campionato'],
  ['fantapunti', 'Fantapunti'],
  ['storico', 'Storico'],
]

/** Le colonne: chiave, etichetta, titolo esteso, e come si ordina. */
const COLONNE = [
  { k: 'giocate', t: 'G', lungo: 'Giocate', spegni: 'sm' },
  { k: 'vinte', t: 'V', lungo: 'Vinte' },
  { k: 'pari', t: 'N', lungo: 'Pareggiate' },
  { k: 'perse', t: 'P', lungo: 'Perse' },
  { k: 'gol_fatti', t: 'GF', lungo: 'Gol fatti', spegni: 'sm' },
  { k: 'gol_subiti', t: 'GS', lungo: 'Gol subiti', spegni: 'sm' },
  { k: 'dr', t: 'DR', lungo: 'Differenza reti' },
  { k: 'fantapunti', t: 'Fantapunti', lungo: 'Fantapunti', spegni: 'md', decimali: 1 },
]

export default function Classifica() {
  const [stagione, setStagione] = useState(LAST_PLAYED_SEASON)
  const [modo, setModo] = useState('classifica')

  const anni = useArchivio('stagioni', stagioni)
  const camp = useArchivio(['classifica', stagione], () => classifica(stagione), [stagione])
  const fp = useArchivio(['fantapunti', stagione], () => classificaFantapunti(stagione), [stagione])
  const fo = useArchivio(['forma', stagione], () => forma(stagione), [stagione])
  const perp = useArchivio('perpetua', classificaPerpetua)

  /* Le ultime cinque giornate di ogni società, dalla più recente. */
  const ultime = useMemo(() => {
    const m = new Map()
    for (const g of fo.dati ?? []) {
      if (!m.has(g.societa)) m.set(g.societa, [])
      m.get(g.societa).push(g)
    }
    for (const [k, v] of m) m.set(k, v.slice(-5))
    return m
  }, [fo.dati])

  /* I titoli di ogni società: le stelline accanto al nome. */
  const titoli = useMemo(() => {
    const m = new Map()
    for (const r of perp.dati ?? []) {
      if (r.posizione === 1) m.set(r.societa, (m.get(r.societa) ?? 0) + 1)
    }
    return m
  }, [perp.dati])

  const stagioneScelta = (anni.dati ?? []).find((s) => s.id === stagione)
  const giocate = Math.max(0, ...(camp.dati ?? []).map((r) => r.giocate))
  const totali = stagioneScelta?.giornate ?? giocate

  return (
    <Pagina className="page container wide classifica-pagina">
      <header className="cl-testa">
        <div>
          <p className="eyebrow">
            {modo === 'storico'
              ? 'Dieci stagioni · dal 2016'
              : `${modo === 'fantapunti' ? 'Fantapunti' : 'Campionato'} · giornata ${giocate} di ${totali}`}
          </p>
          <h1>Classifica</h1>
        </div>

        {modo !== 'storico' && (
          <label className="cl-stagione">
            <span>Stagione</span>
            <select value={stagione} onChange={(e) => setStagione(e.target.value)}>
              {(anni.dati ?? []).filter((s) => s.conclusa).map((s) => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </label>
        )}
      </header>

      <nav className="cl-schede" role="tablist">
        {MODI.map(([m, etichetta]) => (
          <button key={m} role="tab" aria-selected={modo === m}
                  className={modo === m ? 'on' : ''} onClick={() => setModo(m)}>
            {etichetta}
          </button>
        ))}
      </nav>

      {modo === 'storico' ? <Perpetua titoli={titoli} /> : (
        <Sezione stato={modo === 'fantapunti' ? fp : camp} righe={10}>
          {modo === 'fantapunti'
            ? <TabellaFantapunti righe={fp.dati ?? []} titoli={titoli} />
            : <TabellaCampionato righe={camp.dati ?? []} ultime={ultime} titoli={titoli} />}
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

/* ------------------------------------------------------------ campionato */

function TabellaCampionato({ righe, ultime, titoli }) {
  const [ordine, setOrdine] = useState(null)   // null = l'ordine vero della classifica

  const dati = useMemo(() => {
    const con = righe.map((r) => ({ ...r, dr: r.gol_fatti - r.gol_subiti }))
    if (!ordine) return con
    const { k, giu } = ordine
    return [...con].sort((a, b) => (giu ? b[k] - a[k] : a[k] - b[k]) || a.posizione - b.posizione)
  }, [righe, ordine])

  const cambia = (k) => setOrdine((o) =>
    o?.k !== k ? { k, giu: true } : o.giu ? { k, giu: false } : null)

  return (
    <>
      {ordine && (
        <p className="cl-avviso">
          Ordinata per <strong>{COLONNE.find((c) => c.k === ordine.k)?.lungo}</strong>.
          La posizione resta quella del campionato.{' '}
          <button type="button" onClick={() => setOrdine(null)}>Rimetti in ordine</button>
        </p>
      )}

      <div className="cl-tabella">
        <table>
          <thead>
            <tr>
              <th className="c-pos">Pos</th>
              <th className="c-soc">Società</th>
              {COLONNE.map((c) => (
                <Intestazione key={c.k} col={c} ordine={ordine} cambia={cambia} />
              ))}
              <th className="c-forma spegni-md">Ultime cinque</th>
              <th className="c-pt">
                <button type="button" className={`ord ${ordine?.k === 'punti' ? 'on' : ''}`}
                        onClick={() => cambia('punti')} title="Punti">
                  Pt{ordine?.k === 'punti' && <i>{ordine.giu ? '▾' : '▴'}</i>}
                </button>
              </th>
            </tr>
          </thead>
          <CorpoTabella>
            {dati.map((r) => (
              <Riga key={r.societa} className={`cl-riga ${r.posizione <= 3 ? 'podio' : ''}`}>
                <td className="c-pos">
                  <span className="barra" style={{ background: getTeam(r.societa).color }} />
                  {r.posizione}
                </td>
                <td className="c-soc"><Societa id={r.societa} titoli={titoli.get(r.societa)} /></td>
                {COLONNE.map((c) => (
                  <td key={c.k}
                      className={`num ${c.spegni ? 'spegni-' + c.spegni : ''} ${c.k === 'dr' ? segno(r.dr) : ''} ${ordine?.k === c.k ? 'in-ordine' : ''}`}>
                    {c.k === 'dr' ? (r.dr > 0 ? `+${r.dr}` : r.dr)
                      : <Numero valore={r[c.k]} decimali={c.decimali ?? 0}
                                gruppi={c.k !== 'fantapunti'} />}
                  </td>
                ))}
                <td className="c-forma spegni-md"><Forma gare={ultime.get(r.societa)} /></td>
                <td className={`c-pt num ${ordine?.k === 'punti' ? 'in-ordine' : ''}`}>
                  <Numero valore={r.punti} />
                </td>
              </Riga>
            ))}
          </CorpoTabella>
        </table>
      </div>

      {/* Sul telefono la tabella diventa un elenco di schede che si aprono. */}
      <ul className="cl-schedine">
        {dati.map((r) => (
          <Schedina key={r.societa} r={r} titoli={titoli.get(r.societa)}
                    gare={ultime.get(r.societa)} />
        ))}
      </ul>
    </>
  )
}

function Intestazione({ col, ordine, cambia }) {
  const attiva = ordine?.k === col.k
  return (
    <th className={`num ${col.spegni ? 'spegni-' + col.spegni : ''}`}>
      <button type="button" className={`ord ${attiva ? 'on' : ''}`}
              onClick={() => cambia(col.k)} title={`Ordina per ${col.lungo}`}>
        {col.t}{attiva && <i>{ordine.giu ? '▾' : '▴'}</i>}
      </button>
    </th>
  )
}

/**
 * Una scheda per il telefono: si apre e mostra il resto.
 *
 * Non è una tabella rimpicciolita. A 390 px dieci colonne non ci stanno, e
 * comprimerle vuol dire renderle illeggibili tutte insieme: meglio dire subito
 * le tre cose che servono — posizione, chi, punti — e tenere il resto a un
 * tocco di distanza.
 */
function Schedina({ r, titoli, gare }) {
  const [aperta, setAperta] = useState(false)
  const t = getTeam(r.societa)
  return (
    <li className={`schedina ${aperta ? 'aperta' : ''} ${r.posizione <= 3 ? 'podio' : ''}`}
        style={{ '--accent': t.color }}>
      <button type="button" className="schedina-testa" onClick={() => setAperta((v) => !v)}
              aria-expanded={aperta}>
        <span className="s-pos">{r.posizione}</span>
        <img src={logoUrl(t)} alt="" />
        <span className="s-nome">
          {t.name}
          {titoli > 0 && <Stelline n={titoli} />}
        </span>
        <span className="s-pt"><b>{r.punti}</b><em>pt</em></span>
        <span className="s-freccia" aria-hidden="true">{aperta ? '−' : '+'}</span>
      </button>

      {aperta && (
        <div className="schedina-corpo">
          <dl>
            <div><dt>Giocate</dt><dd>{r.giocate}</dd></div>
            <div><dt>Vinte</dt><dd>{r.vinte}</dd></div>
            <div><dt>Pari</dt><dd>{r.pari}</dd></div>
            <div><dt>Perse</dt><dd>{r.perse}</dd></div>
            <div><dt>Gol fatti</dt><dd>{r.gol_fatti}</dd></div>
            <div><dt>Gol subiti</dt><dd>{r.gol_subiti}</dd></div>
            <div><dt>Diff. reti</dt><dd className={segno(r.dr)}>{r.dr > 0 ? `+${r.dr}` : r.dr}</dd></div>
            <div><dt>Fantapunti</dt><dd>{Number(r.fantapunti).toFixed(1).replace('.', ',')}</dd></div>
          </dl>
          <div className="schedina-forma">
            <span>Ultime cinque</span>
            <Forma gare={gare} />
          </div>
          <Link to={`/squadre/${r.societa}`} className="schedina-vai">
            Scheda di {t.name} →
          </Link>
        </div>
      )}
    </li>
  )
}

/* ----------------------------------------------------------- fantapunti */

function TabellaFantapunti({ righe, titoli }) {
  const max = Math.max(...righe.map((r) => Number(r.fantapunti) || 0), 1)
  const min = Math.min(...righe.map((r) => Number(r.fantapunti) || 0), max)
  return (
    <div className="cl-tabella cl-fp">
      <table>
        <thead>
          <tr>
            <th className="c-pos">Pos</th>
            <th className="c-soc">Società</th>
            <th className="c-barra">Distacco</th>
            <th className="c-pt">Fantapunti</th>
          </tr>
        </thead>
        <CorpoTabella>
          {righe.map((r) => {
            const v = Number(r.fantapunti) || 0
            // la barra parte dal minimo, non da zero: fra 2583 e 2699 la
            // differenza c'e', e partire da zero la farebbe sparire
            const q = max === min ? 1 : (v - min) / (max - min)
            return (
              <Riga key={r.societa} className={`cl-riga ${r.posizione <= 3 ? 'podio' : ''}`}>
                <td className="c-pos">
                  <span className="barra" style={{ background: getTeam(r.societa).color }} />
                  {r.posizione}
                </td>
                <td className="c-soc"><Societa id={r.societa} titoli={titoli.get(r.societa)} /></td>
                <td className="c-barra">
                  <span className="misura">
                    <i style={{ width: `${8 + q * 92}%`, background: getTeam(r.societa).color }} />
                  </span>
                </td>
                <td className="c-pt num"><Numero valore={v} decimali={1} gruppi={false} /></td>
              </Riga>
            )
          })}
        </CorpoTabella>
      </table>
    </div>
  )
}

/* --------------------------------------------------------------- pezzi */

function Societa({ id, titoli }) {
  const t = getTeam(id)
  return (
    <Link to={`/squadre/${id}`} className="cl-soc">
      <img src={logoUrl(t)} alt="" loading="lazy" />
      <span>
        <b>{t.name}</b>
        {titoli > 0 && <Stelline n={titoli} />}
      </span>
    </Link>
  )
}

function Stelline({ n }) {
  return (
    <span className="stelline" title={`${n} ${n === 1 ? 'titolo' : 'titoli'}`}>
      {'★'.repeat(Math.min(n, 5))}{n > 5 && <em>×{n}</em>}
    </span>
  )
}

function Forma({ gare }) {
  if (!gare?.length) return <span className="muted">—</span>
  return (
    <span className="forma">
      {gare.map((g, i) => (
        <i key={i} className={`pastiglia p-${g.esito}`}
           title={`${g.giornata}ª · ${g.gol_fatti}-${g.gol_subiti}${g.avversario ? ` con ${getTeam(g.avversario).name}` : ''}`}>
          {g.esito}
        </i>
      ))}
    </span>
  )
}

const segno = (n) => (n > 0 ? 'su' : n < 0 ? 'giu' : '')

/* ------------------------------------------------------------- perpetua */

function Perpetua({ titoli }) {
  const stato = useArchivio('perpetua', classificaPerpetua)

  const righe = useMemo(() => {
    const acc = new Map()
    for (const r of stato.dati ?? []) {
      const c = acc.get(r.societa) ?? {
        societa: r.societa, stagioni: 0, giocate: 0, vinte: 0, pari: 0,
        perse: 0, gol_fatti: 0, gol_subiti: 0, punti: 0,
      }
      c.stagioni += 1
      for (const k of ['giocate', 'vinte', 'pari', 'perse', 'gol_fatti', 'gol_subiti', 'punti']) {
        c[k] += r[k]
      }
      acc.set(r.societa, c)
    }
    return [...acc.values()]
      .map((r) => ({ ...r, dr: r.gol_fatti - r.gol_subiti, ppg: +(r.punti / r.giocate).toFixed(2) }))
      .sort((a, b) => b.punti - a.punti || b.dr - a.dr)
  }, [stato.dati])

  return (
    <Sezione stato={stato} righe={11}>
      <div className="cl-tabella">
        <table>
          <thead>
            <tr>
              <th className="c-pos">Pos</th><th className="c-soc">Società</th>
              <th className="num spegni-sm">St</th><th className="num spegni-sm">G</th>
              <th className="num">V</th><th className="num">N</th><th className="num">P</th>
              <th className="num spegni-sm">GF</th><th className="num spegni-sm">GS</th>
              <th className="num">DR</th>
              <th className="num spegni-md">Pt/G</th>
              <th className="c-pt">Pt</th>
            </tr>
          </thead>
          <CorpoTabella>
            {righe.map((r, i) => (
              <Riga key={r.societa} className={`cl-riga ${i < 3 ? 'podio' : ''}`}>
                <td className="c-pos">
                  <span className="barra" style={{ background: getTeam(r.societa).color }} />
                  {i + 1}
                </td>
                <td className="c-soc"><Societa id={r.societa} titoli={titoli.get(r.societa)} /></td>
                <td className="num spegni-sm">{r.stagioni}</td>
                <td className="num spegni-sm">{r.giocate}</td>
                <td className="num">{r.vinte}</td>
                <td className="num">{r.pari}</td>
                <td className="num">{r.perse}</td>
                <td className="num spegni-sm">{r.gol_fatti}</td>
                <td className="num spegni-sm">{r.gol_subiti}</td>
                <td className={`num ${segno(r.dr)}`}>{r.dr > 0 ? `+${r.dr}` : r.dr}</td>
                <td className="num spegni-md">{r.ppg}</td>
                <td className="c-pt num"><Numero valore={r.punti} /></td>
              </Riga>
            ))}
          </CorpoTabella>
        </table>
      </div>
    </Sezione>
  )
}
