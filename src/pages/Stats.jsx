import { useMemo } from 'react'
import TeamBadge from '../components/TeamBadge'
import { matches, rosters, seasons, standings } from '../lib/data'
import './Stats.css'

/** Tutti i record calcolati dai risultati e dalle rose. */
function calcola() {
  const giocate = matches.filter((m) => m.played)

  let piuLarga = null
  let piuGol = null
  let miglioreFp = null
  let peggioreFp = null

  for (const m of giocate) {
    const scarto = Math.abs(m.homeGoals - m.awayGoals)
    const tot = m.homeGoals + m.awayGoals
    if (!piuLarga || scarto > piuLarga.scarto) piuLarga = { ...m, scarto }
    if (!piuGol || tot > piuGol.tot) piuGol = { ...m, tot }
    for (const lato of ['home', 'away']) {
      const fp = m[`${lato}Fp`]
      if (fp == null) continue
      const rec = { season: m.season, round: m.round, team: m[lato], fp }
      if (!miglioreFp || fp > miglioreFp.fp) miglioreFp = rec
      if (!peggioreFp || fp < peggioreFp.fp) peggioreFp = rec
    }
  }

  // striscia di vittorie più lunga
  const perSquadra = new Map()
  for (const m of giocate) {
    for (const [lato, opp] of [['home', 'away'], ['away', 'home']]) {
      const id = m[lato]
      if (!id) continue
      if (!perSquadra.has(id)) perSquadra.set(id, [])
      perSquadra.get(id).push({
        season: m.season, round: m.round,
        vinta: m[`${lato}Goals`] > m[`${opp}Goals`],
      })
    }
  }
  let striscia = { team: null, n: 0 }
  for (const [id, lista] of perSquadra) {
    lista.sort((a, b) => a.season.localeCompare(b.season) || a.round - b.round)
    let cur = 0
    for (const p of lista) {
      cur = p.vinta ? cur + 1 : 0
      if (cur > striscia.n) striscia = { team: id, n: cur, season: p.season }
    }
  }

  // acquisto più caro di sempre
  const caro = rosters.reduce(
    (max, r) => ((r.cost ?? 0) > (max?.cost ?? 0) ? r : max), null
  )

  // miglior fantamedia con almeno 20 presenze
  const fm = rosters
    .filter((r) => r.fm != null && (r.apps ?? 0) >= 20)
    .sort((a, b) => b.fm - a.fm)[0]

  // gol per stagione
  const golStagione = seasons
    .map((s) => {
      const ms = matches.filter((m) => m.season === s && m.played)
      if (!ms.length) return null
      const gol = ms.reduce((n, m) => n + m.homeGoals + m.awayGoals, 0)
      return { season: s, gol, media: +(gol / ms.length).toFixed(2) }
    })
    .filter(Boolean)

  return { piuLarga, piuGol, miglioreFp, peggioreFp, striscia, caro, fm, golStagione, giocate: giocate.length }
}

export default function Stats() {
  const r = useMemo(calcola, [])
  const maxMedia = Math.max(...r.golStagione.map((g) => g.media))

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Archivio</p>
        <h1>Record e statistiche</h1>
        <p className="lede">
          Dieci stagioni, {r.giocate.toLocaleString('it-IT')} partite giocate.
          Tutto quello che segue è calcolato dai risultati, non inserito a mano.
        </p>
      </header>

      <section className="block">
        <h2 className="section-title">I record</h2>
        <div className="record-grid">
          <Record
            titolo="Vittoria più larga"
            valore={`${r.piuLarga.homeGoals}–${r.piuLarga.awayGoals}`}
            dettaglio={<><TeamBadge id={r.piuLarga.home} size="sm" label="short" /> contro <TeamBadge id={r.piuLarga.away} size="sm" label="short" /></>}
            nota={`${r.piuLarga.season} · ${r.piuLarga.round}ª giornata`}
          />
          <Record
            titolo="Partita con più gol"
            valore={`${r.piuGol.homeGoals}–${r.piuGol.awayGoals}`}
            dettaglio={<><TeamBadge id={r.piuGol.home} size="sm" label="short" /> contro <TeamBadge id={r.piuGol.away} size="sm" label="short" /></>}
            nota={`${r.piuGol.season} · ${r.piuGol.round}ª giornata`}
          />
          <Record
            titolo="Miglior punteggio"
            valore={r.miglioreFp.fp.toFixed(1)}
            dettaglio={<TeamBadge id={r.miglioreFp.team} size="sm" />}
            nota={`${r.miglioreFp.season} · ${r.miglioreFp.round}ª giornata`}
          />
          <Record
            titolo="Peggior punteggio"
            valore={r.peggioreFp.fp.toFixed(1)}
            dettaglio={<TeamBadge id={r.peggioreFp.team} size="sm" />}
            nota={`${r.peggioreFp.season} · ${r.peggioreFp.round}ª giornata`}
          />
          <Record
            titolo="Striscia di vittorie"
            valore={r.striscia.n}
            dettaglio={<TeamBadge id={r.striscia.team} size="sm" />}
            nota={`conclusa nel ${r.striscia.season}`}
          />
          <Record
            titolo="Acquisto più caro"
            valore={r.caro.cost}
            dettaglio={<span className="nome-rec">{r.caro.player}</span>}
            nota={`${r.caro.season} · ${r.caro.team ? '' : ''}`}
            badge={<TeamBadge id={r.caro.team} size="sm" label="short" />}
          />
          <Record
            titolo="Miglior fantamedia"
            valore={r.fm.fm.toFixed(2)}
            dettaglio={<span className="nome-rec">{r.fm.player}</span>}
            nota={`${r.fm.season} · ${r.fm.apps} presenze`}
          />
        </div>
      </section>

      <section className="block">
        <h2 className="section-title">Gol per stagione</h2>
        <p className="lede">
          Media gol a partita. Il salto del 2024-25 riflette il cambio della scala
          punti-gol introdotto quell'anno dal regolamento.
        </p>
        <div className="barre">
          {r.golStagione.map((g) => (
            <div key={g.season} className="barra-riga">
              <span className="num s-lab">{g.season}</span>
              <span className="barra">
                <i style={{ width: `${(g.media / maxMedia) * 100}%` }} />
              </span>
              <span className="num s-val">{g.media}</span>
              <span className="num s-tot muted">{g.gol} gol</span>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2 className="section-title">Miglior stagione di ogni società</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">Società</th>
                <th className="left">Stagione</th>
                <th>Pos.</th>
                <th>Punti</th>
                <th>GF</th>
                <th>DR</th>
              </tr>
            </thead>
            <tbody>
              {migliori().map((m) => (
                <tr key={m.team}>
                  <td className="left"><TeamBadge id={m.team} size="sm" /></td>
                  <td className="left num season-cell">{m.season}</td>
                  <td className="num">{m.position}º</td>
                  <td className="num strong">{m.points}</td>
                  <td className="num muted">{m.goalsFor}</td>
                  <td className="num">{m.goalDiff > 0 ? `+${m.goalDiff}` : m.goalDiff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function migliori() {
  const best = new Map()
  for (const s of seasons) {
    for (const row of standings[s] ?? []) {
      const cur = best.get(row.team)
      if (!cur || row.points > cur.points) best.set(row.team, { ...row, season: s })
    }
  }
  return [...best.values()].sort((a, b) => b.points - a.points)
}

function Record({ titolo, valore, dettaglio, nota, badge }) {
  return (
    <div className="record card">
      <span className="r-tit">{titolo}</span>
      <strong className="r-val num">{valore}</strong>
      <div className="r-det">{dettaglio}{badge}</div>
      <span className="r-nota num">{nota}</span>
    </div>
  )
}
