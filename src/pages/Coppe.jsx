import { useState } from 'react'
import { Link } from 'react-router-dom'
import cups, { cupOf, STAGIONI, stagioneCoppe, alboLeggibile, tabelloneDi } from '../lib/coppe'
import { getTeam, logoUrl } from '../lib/core'
import './Coppe.css'

/**
 * Struttura delle competizioni, dal regolamento (§5.3 e §6), piu' il
 * tabellone dell'ultima stagione archiviata.
 *
 * `dati` e' l'id con cui la competizione compare in cups.json: non sempre
 * coincide con l'id della scheda, perche' le schede esistevano prima dei
 * dati e i loro id sono gia' usati come ancore.
 *
 * Nessun importo in euro in questa pagina: e' pubblica. Il montepremi sta
 * nell'area riservata ai mister.
 */
const COPPE = [
  {
    id: 'coppa-italia',
    dati: 'coppa-italia',
    nome: 'Coppa Italia',
    colore: '#6e0f0f',
    formula: 'Le migliori 8 della classifica Fantapunti dopo 10 giornate. Quarti, semifinali andata e ritorno, finale unica a Natale come da tradizione.',
    note: 'Non vale il +1 per chi gioca in casa: FantaPazz non permette di inserirlo.',
    premi: [{ v: '1 cr', l: 'diritti TV finalista' }],
  },
  {
    id: 'qualificazione-champions',
    dati: 'qualificazione-champions',
    nome: 'Qualificazione Champions',
    colore: '#1f4d7a',
    formula: 'Due gironi da 5 secondo il Ranking Caprera, 10 giornate. Le prime due di ogni girone vanno in Champions, terza e quarta in Europa League.',
    premi: [],
  },
  {
    id: 'champions',
    dati: 'champions',
    nome: 'Champions League',
    colore: '#2a1a6b',
    formula: 'Le prime due di ogni girone di qualificazione. Semifinali andata e ritorno, finale unica.',
    note: 'Vale il +1 per chi gioca in casa, esclusa la finale.',
    premi: [{ v: '2 cr', l: 'diritti TV finalista' }],
  },
  {
    id: 'europa',
    dati: 'europa-league',
    nome: 'Europa League',
    colore: '#b0803a',
    formula: 'Terza e quarta di ogni girone di qualificazione. Semifinali andata e ritorno, finale unica.',
    premi: [{ v: '1 cr', l: 'diritti TV finalista' }],
  },
  {
    id: 'conference',
    dati: 'conference-league',
    nome: 'Conference League',
    colore: '#0f5a3c',
    formula: 'Sei partecipanti: le 4 sconfitte delle semifinali di Champions ed Europa, più le 2 società non qualificate dai gironi. Turni di sola andata.',
    premi: [{ v: '1 cr', l: 'diritti TV finalista' }],
  },
  {
    id: 'supercoppa-europea',
    dati: 'supercoppa-europea',
    nome: 'Supercoppa Europea',
    colore: '#5a2020',
    formula: 'Tra le vincenti di Champions ed Europa League. Si gioca alla 3ª giornata Caprera, partita secca: vince chi fa più Fantapunti.',
    note: 'Il vincitore della Champions gioca in casa (+1) e vince in caso di parità.',
    premi: [{ v: '2 cr', l: 'diritti TV' }],
  },
  {
    id: 'supercoppa-italiana',
    dati: 'supercoppa-italiana',
    nome: 'Supercoppa Italiana',
    colore: '#7a1010',
    formula: 'Tra le vincenti di Lega Caprera e Coppa Italia. Alla 2ª giornata. Se la vincente è la stessa, gioca la finalista di Coppa Italia.',
    premi: [{ v: '1 cr', l: 'diritti TV' }],
  },
  {
    id: 'mondiale',
    nome: 'Mondiale per Club',
    colore: '#a8863f',
    novita: '2026/27',
    formula: 'Biennale. Primo anno: 18 partite di qualificazione, andata e ritorno, sulle giornate pari. Si qualificano le migliori 4. Secondo anno: girone a 4 andata e ritorno, poi semifinali e finale in gara unica.',
    premi: [{ v: '1 cr', l: 'qualificazione' }, { v: '1 cr', l: 'semifinale' }],
  },
  {
    id: 'fantapunti',
    dati: 'fantapunti',
    nome: 'Classifica Fantapunti',
    colore: '#6b1f33',
    formula: 'Somma dei fantapunti realizzati in campionato, senza il +1 di chi gioca in casa. Determina anche chi va in Coppa Italia.',
    premi: [{ v: '5 cr', l: 'primo in classifica' }],
  },
]

function Societa({ id, vinta }) {
  const t = getTeam(id)
  if (!t) return <span className="sq">—</span>
  const logo = logoUrl(t)
  return (
    <Link to={`/squadre/${t.id}`} className={vinta ? 'sq vinta' : 'sq'}>
      {logo && <img src={logo} alt="" />}
      <span>{t.name}</span>
    </Link>
  )
}

/**
 * Una gara. I nomi dei campi sono quelli di cups.json, che arriva da Fantapazz
 * in italiano: casa/fuori, golCasa/golFuori, fpCasa/fpFuori.
 *
 * `vincente` non e' chi ha segnato di piu' in questa gara ma chi ha vinto la
 * sfida: nell'andata e ritorno puo' benissimo essere chi ha perso la partita
 * che si sta guardando, e in finale e' chi ha piu' fantapunti se il risultato
 * e' in parita'. Per questo il grassetto lo decide il turno, non il punteggio.
 */
function Partita({ p, vincente }) {
  return (
    <div className="match">
      <Societa id={p.casa} vinta={p.casa === vincente} />
      <span className="score">
        {p.golCasa} - {p.golFuori}
        <em>{p.fpCasa} · {p.fpFuori}</em>
      </span>
      <Societa id={p.fuori} vinta={p.fuori === vincente} />
    </div>
  )
}

/** Una sfida: una gara sola, oppure andata e ritorno con il verdetto sotto. */
function Sfida({ s, girone, verbo = 'passa' }) {
  const t = getTeam(s.vincente)
  // Il totale si legge dalla parte di chi passa: "passa X 3-2", non "2-3".
  // Le sfide dei gironi non hanno un totale: si guarda solo se c'e'.
  const i = s.aggregato ? s.squadre.indexOf(s.vincente) : -1
  const agg = i === 1 ? [s.aggregato[1], s.aggregato[0]] : s.aggregato
  return (
    <div className={s.andataRitorno ? 'sfida doppia' : 'sfida'}>
      {s.legs.map((p, i) => <Partita key={i} p={p} vincente={s.vincente} />)}
      {!girone && (
        <p className="verdetto">
          {t ? (
            <>
              {verbo} <strong>{t.name}</strong>
              {s.andataRitorno && <span className="agg"> {agg[0]}-{agg[1]}</span>}
              {s.come && <span className="come"> ai {s.come}</span>}
            </>
          ) : (
            <span className="aperto">parita' su tutti i criteri — in attesa della Presidenza</span>
          )}
        </p>
      )}
    </div>
  )
}

function Classifica({ righe }) {
  return (
    <div className="tabellone">
      <div className="turno">
        <h4>Classifica</h4>
        {righe.map((r, i) => (
          <div key={r.team} className="riga-fp">
            <b className="num pos">{i + 1}</b>
            <Societa id={r.team} vinta={i === 0} />
            <span className="num">{r.fantapunti.toLocaleString('it-IT')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tabellone({ coppa }) {
  if (!coppa) return null
  if (coppa.classifica) return <Classifica righe={coppa.classifica} />
  const turni = tabelloneDi(coppa)
  if (!turni.length) return null
  // dieci giornate di gironi farebbero una scheda alta tre schermi: si scorre
  return (
    <div className={turni.length > 5 ? 'tabellone lungo' : 'tabellone'}>
      {turni.map((t) => (
        <div key={t.titolo} className="turno">
          <h4>{t.titolo}</h4>
          {/* onestà: questa gara la mette Fantapazz, non il regolamento */}
          {t.consolazione && (
            <p className="nota-turno">
              Fra le due perdenti delle semifinali. Il regolamento non prevede
              una finale per il terzo posto: le eliminate vanno in Conference.
            </p>
          )}
          {/* dai turni si passa, la finale si vince */}
          {t.sfide.map((s, i) => (
            <Sfida key={i} s={s} girone={t.girone}
                   verbo={t.titolo.startsWith('Finale') ? 'vince' : 'passa'} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Coppe() {
  const [stagione, setStagione] = useState(STAGIONI[0])
  const campione = getTeam(stagioneCoppe(stagione)?.campione)

  const trofei = COPPE.map((c) => ({ scheda: c, dati: c.dati ? cupOf(c.dati, stagione) : null }))
  const vinte = trofei.filter((t) => t.dati?.vincitore)
  const aiFantapunti = vinte.filter((t) => t.dati.aiFantapunti)
  const contese = trofei.filter((t) => t.dati?.finaleInParita)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Competizioni</p>
        <h1>Coppe</h1>
        <p className="lede">
          Oltre al campionato, la Lega Caprera assegna sette trofei. Qui la formula
          di ciascuno, i premi e i tabelloni di ogni stagione dal 2016-17.
        </p>
      </header>

      {/* Una scheda per competizione con l'elenco delle vincenti e l'anno.
          Prima era una tabella incrociata di stemmi senza nomi: ci stava tutto
          in poco spazio, ma per sapere chi avesse vinto cosa bisognava contare
          le colonne. */}
      <section className="block">
        <h2 className="section-title">Albo d'oro</h2>
        <p className="lede">
          Chi ha vinto, e quando. Una scheda per competizione, dalla stagione
          più recente alla prima.
        </p>
        <div className="albo-griglia">
          {COPPE.filter((c) => c.dati && c.dati !== 'qualificazione-champions').map((c) => {
            const { righe, edizioni, recordman } = alboLeggibile(c.dati)
            if (!righe.length) return null
            return (
              <article key={c.id} className="albo-card card" style={{ '--accent': c.colore }}>
                <header>
                  <h3>{c.nome}</h3>
                  <span className="edizioni">{edizioni} edizioni</span>
                </header>
                <ol className="albo-lista">
                  {righe.map((r, i) => (
                    <li key={r.stagione} className={i === 0 ? 'in-carica' : ''}>
                      <span className="stagione num">{r.stagione}</span>
                      <Societa id={r.vincitore} vinta />
                      {r.aiFantapunti && <span className="dettaglio">ai fantapunti</span>}
                    </li>
                  ))}
                </ol>
                {recordman.length > 0 && (
                  <footer className="recordman">
                    {recordman.length === 1 ? 'Più titoli: ' : 'A pari titoli: '}
                    {recordman.map((r) => `${getTeam(r.team)?.name ?? r.team} (${r.n})`).join(', ')}
                  </footer>
                )}
              </article>
            )
          })}
        </div>
        <p className="note">
          La riga in evidenza è la detentrice in carica. «Ai fantapunti» segnala
          le finali finite in parità nel risultato e assegnate, come prevede il
          regolamento, a chi aveva realizzato più fantapunti.
        </p>
      </section>

      <div className="scelta-stagione">
        {STAGIONI.map((s) => (
          <button key={s} className={s === stagione ? 'on' : ''}
                  onClick={() => setStagione(s)}>{s}</button>
        ))}
      </div>

      <section className="block">
        <h2 className="section-title">Albo {stagione}</h2>
        <div className="albo-stagione">
          {campione && (
            <article className="trofeo campione">
              <span className="etichetta">Lega Caprera</span>
              <Societa id={campione.id} vinta />
            </article>
          )}
          {vinte.map(({ scheda, dati }) => (
            <article key={scheda.id} className="trofeo" style={{ '--accent': scheda.colore }}>
              <span className="etichetta">{scheda.nome}</span>
              <Societa id={dati.vincitore} vinta />
              {dati.aiFantapunti && <span className="dettaglio">ai fantapunti</span>}
            </article>
          ))}
        </div>

        {aiFantapunti.length > 0 && (
          <div className="avviso card">
            <strong>Due finali decise ai fantapunti.</strong>{' '}
            {aiFantapunti.map((t) => t.scheda.nome).join(' e ')} sono finite in
            parità nel risultato: come prevede il regolamento, in gara secca
            vince chi ha realizzato più fantapunti. Fantapazz si ferma al
            punteggio in gol, il nome del vincitore lo mettiamo noi applicando
            quella regola.
          </div>
        )}

        {contese.length > 0 && (
          <div className="avviso card">
            <strong>Finale senza vincente.</strong>{' '}
            {contese.map((t) => t.scheda.nome).join(' e ')}: pari anche nei
            fantapunti, quindi il regolamento non basta a sciogliere il nodo.
            In attesa della Presidenza.
          </div>
        )}
      </section>

      <div className="coppe-grid">
        {trofei.map(({ scheda: c, dati }) => (
          <article key={c.id} className="coppa card" style={{ '--accent': c.colore }}>
            <header>
              <h2>{c.nome}</h2>
              {c.novita && <span className="novita">nuova · {c.novita}</span>}
              {dati?.vincitore && <span className="attiva">{stagione} · vinta</span>}
            </header>
            <p className="formula">{c.formula}</p>
            {c.note && <p className="nota-coppa">{c.note}</p>}

            {dati && <Tabellone coppa={dati} />}

            {c.premi.length > 0 && (
              <div className="premi">
                {c.premi.map((p, i) => (
                  <span key={i} className="premio">
                    <b className="num">{p.v}</b>
                    <em>{p.l}</em>
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <section className="block">
        <h2 className="section-title">Montepremi</h2>
        <p className="lede">
          Ogni competizione ha un premio in denaro, finanziato interamente dalle
          quote di iscrizione. Gli importi sono riservati ai mister e si trovano
          nel regolamento e nell'area personale — non sono pubblicati qui.
        </p>
        <div className="peso-grid">
          {[
            ['Lega Caprera — Campionato', 5],
            ['Champions League', 4],
            ['Coppa Italia', 2],
            ['Europa League', 2],
            ['Mondiale per Club', 2],
            ['Supercoppa Europea', 1],
            ['Conference League', 1],
            ['Fantapunti', 1],
            ['Supercoppa Italiana', 1],
          ].map(([nome, peso]) => (
            <div key={nome} className="peso-riga">
              <span className="peso-nome">{nome}</span>
              <span className="peso-bar">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className={i < peso ? 'on' : ''} />
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="note">
          Il peso relativo del montepremi, non l'importo. I pagamenti avvengono
          per bonifico entro il 31 luglio (DPCM Vincite 08.2026).
        </p>
      </section>
    </div>
  )
}
