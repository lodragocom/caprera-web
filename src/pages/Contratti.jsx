import { useMemo, useState, useDeferredValue } from 'react'
import TeamBadge from '../components/TeamBadge'
import { ACTIVE_TEAMS, getTeam, teamName, LAST_PLAYED_SEASON } from '../lib/core'
import { useArchivio, contrattiPubblici } from '../lib/archivio'
import { Pagina, Sezione } from '../components/moto'
import { Barra, Campo, Cerca, Gruppo, Schede, Scheda, Conto, Avviso } from '../components/Filtri'
import './Contratti.css'

const RUOLI = ['D', 'C', 'A']
// Tetto slot per ruolo dal 2025/26 (Referendum Jobs Act 06.2025)
const TETTO = { D: 3, C: 3, A: 2 }

/*
 * Che ne e' di un contratto, adesso.
 *
 * La pagina prima mostrava «dalla → alla» e una barra di caselle, e lasciava a
 * chi legge il compito di capire da solo se quel contratto conta ancora. Sono
 * centottantasei righe: nessuno lo fa. Lo stato invece e' una domanda sola con
 * tre risposte, e si puo' rispondere una volta per tutte.
 */
function stato(c) {
  if (c.to < LAST_PLAYED_SEASON) return 'finito'
  if (c.to === LAST_PLAYED_SEASON) return 'scade'
  return 'corso'
}

const STATI = {
  corso:  { et: 'in corso', desc: 'copre stagioni oltre questa' },
  scade:  { et: 'in scadenza', desc: `finisce con il ${LAST_PLAYED_SEASON}` },
  finito: { et: 'finito', desc: 'gia scaduto' },
}

export default function Contratti() {
  const [team, setTeam] = useState('')
  const [ruolo, setRuolo] = useState('')
  const [quali, setQuali] = useState('corso')
  const [q, setQ] = useState('')
  const cerca = useDeferredValue(q)

  const st = useArchivio('contrattiPubblici', contrattiPubblici)
  const contratti = useMemo(
    () => (st.dati ?? []).map((c) => ({
      team: c.societa, player: c.nome, role: c.ruolo,
      under: c.under, from: c.dalla, to: c.alla, years: c.anni,
      stato: stato({ to: c.alla }),
    })),
    [st.dati]
  )

  const stagioni = useMemo(
    () => [...new Set(contratti.flatMap((c) => [c.from, c.to]))].sort(),
    [contratti]
  )

  const conti = useMemo(() => {
    const n = { corso: 0, scade: 0, finito: 0, under: 0 }
    for (const c of contratti) { n[c.stato] += 1; if (c.under) n.under += 1 }
    return n
  }, [contratti])

  const righe = useMemo(() => {
    const norm = cerca.trim().toLowerCase()
    return contratti
      .filter((c) =>
        (!team || c.team === team) &&
        (!ruolo || c.role === ruolo) &&
        (quali === 'tutti'
          ? true
          : quali === 'under' ? c.under : c.stato === quali) &&
        (!norm || c.player.toLowerCase().includes(norm)
               || teamName(c.team).toLowerCase().includes(norm)))
      /* Prima si ordinava per data d'inizio, che e' la cosa che interessa
         meno: il contratto piu' vecchio in cima e la scadenza da cercare a
         occhio. Adesso comanda la scadenza — i piu' lunghi per primi, che
         sono quelli che vincolano davvero. */
      .sort((a, b) => b.to.localeCompare(a.to)
                   || a.player.localeCompare(b.player))
  }, [contratti, team, ruolo, quali, cerca])

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Jobs Act</p>
        <h1>Contratti</h1>
        <p className="lede">
          Ogni estate una società può mettere sotto contratto tre senior — uno per
          ruolo — più un Under. Dal 2025/26 c'è un tetto: 3 difensori, 3
          centrocampisti, 2 attaccanti. Un calciatore sotto contratto all'asta non
          ci passa: resta dov'è finché il contratto regge.
        </p>
      </header>

      <Barra>
        <Cerca valore={q} cambia={setQ} invito="Calciatore o società…" />
        <Campo etichetta="Società">
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">Tutte</option>
            {ACTIVE_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Campo>
        <Gruppo etichetta="Stato del contratto" ora={quali} scegli={setQuali}
                voci={[
                  ['corso', 'In corso', conti.corso],
                  ['scade', 'In scadenza', conti.scade],
                  ['finito', 'Finiti', conti.finito],
                  ['under', 'Under', conti.under],
                  ['tutti', 'Tutti', contratti.length],
                ]} />
        <Gruppo etichetta="Ruolo" ora={ruolo} scegli={setRuolo}
                voci={[['', 'Tutti'], ...RUOLI.map((r) => [r, r])]} />
      </Barra>

      <Schede>
        <Scheda etichetta="In corso" valore={conti.corso}
                sotto={`oltre il ${LAST_PLAYED_SEASON}`} />
        <Scheda etichetta="In scadenza" valore={conti.scade}
                sotto={`finiscono col ${LAST_PLAYED_SEASON}`} />
        <Scheda etichetta="Under" valore={conti.under} sotto="sul totale" />
        <Scheda etichetta="In archivio" valore={contratti.length}
                sotto={stagioni.length ? `dal ${stagioni[0]}` : null} />
      </Schede>

      <Avviso>
        <b>Dati provvisori.</b> Questi {contratti.length} contratti vengono dal PDF
        storico della Presidenza, aggiornato a settembre 2024: mancano quelli
        stipulati dopo l'asta 2025/26 e le clausole rescissorie. Gli ingaggi e le
        clausole non stanno su questa pagina — sono riservati ai mister.
      </Avviso>

      {team && <Slot contratti={contratti} teamId={team} />}

      <Conto>
        {righe.length} {righe.length === 1 ? 'contratto' : 'contratti'}
        {quali !== 'tutti' && ` · ${quali === 'under' ? 'solo Under' : STATI[quali].et}`}
      </Conto>

      <Sezione stato={st} righe={10} vuoto="Nessun contratto in archivio.">
        <div className="ct-tabella">
          <table>
            <thead>
              <tr>
                <th className="left">R</th>
                <th className="left">Calciatore</th>
                {!team && <th className="left">Società</th>}
                <th className="left">Scadenza</th>
                <th>Anni</th>
                <th className="left ct-cov">
                  {/* Le stagioni in testa alla barra: senza, le caselle sono
                      decorazione. Con l'anno in corso segnato, la barra dice a
                      colpo d'occhio se il contratto e' passato o futuro. */}
                  <span className="ct-righello">
                    {stagioni.map((s) => (
                      <i key={s} className={s === LAST_PLAYED_SEASON ? 'ora' : ''}>
                        {s.slice(2, 4)}
                      </i>
                    ))}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {righe.map((c, i) => (
                <tr key={`${c.team}-${c.player}-${c.from}-${i}`}>
                  <td className="left">
                    <span className={`badge role-${c.role}`}>{c.role}</span>
                  </td>
                  <td className="left strong">
                    {c.player}
                    {c.under && <span className="under" title="Under">★</span>}
                  </td>
                  {!team && (
                    <td className="left"><TeamBadge id={c.team} size="sm" label="short" /></td>
                  )}
                  <td className="left">
                    <span className={`ct-stato s-${c.stato}`}>{c.to}</span>
                  </td>
                  <td className="num muted">{c.years}</td>
                  <td className="left">
                    <Copertura from={c.from} to={c.to} stagioni={stagioni} stato={c.stato} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sezione>
    </Pagina>
  )
}

/** Le stagioni coperte, con l'anno in corso marcato. */
function Copertura({ from, to, stagioni, stato }) {
  const i0 = stagioni.indexOf(from)
  const i1 = stagioni.indexOf(to)
  return (
    <span className={`ct-barra b-${stato}`} title={`${from} → ${to}`}>
      {stagioni.map((s, i) => (
        <i key={s} title={s}
           className={`${i >= i0 && i <= i1 ? 'on' : ''}${s === LAST_PLAYED_SEASON ? ' ora' : ''}`} />
      ))}
    </span>
  )
}

/**
 * Slot occupati per ruolo, contati sui contratti che coprono ancora l'anno in
 * corso — non su quelli che finiscono con l'ultima stagione presente nei dati,
 * che era il conto di prima e cambiava da solo appena arrivava un contratto
 * piu' lungo.
 */
function Slot({ teamId, contratti }) {
  const attivi = contratti.filter((c) => c.team === teamId && c.to >= LAST_PLAYED_SEASON)
  const team = getTeam(teamId)

  return (
    <div className="slot-row">
      {RUOLI.map((r) => {
        const usati = attivi.filter((c) => c.role === r).length
        const max = TETTO[r]
        return (
          <div key={r} className="slot card">
            <span className={`badge role-${r}`}>{r}</span>
            <strong className="num">{usati}<span className="su">/{max}</span></strong>
            <span className="slot-label">
              {usati >= max ? 'pieno' : `${max - usati} liber${max - usati === 1 ? 'o' : 'i'}`}
            </span>
            <span className="slot-bar">
              {Array.from({ length: max }, (_, i) => (
                <i key={i} className={i < usati ? 'on' : ''}
                   style={i < usati ? { background: team?.color } : undefined} />
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}
