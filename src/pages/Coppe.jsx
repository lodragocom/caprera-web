import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tabelloneDi } from '../lib/coppe'
import { getTeam, logoUrl } from '../lib/core'
import {
  useArchivio, coppeStagione, stagioni, albo, classifica,
} from '../lib/archivio'
import { Pagina } from '../components/moto'
import { Barra, Campo, Gruppo } from '../components/Filtri'
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

/*
 * Un tabellone a eliminazione, letto come si legge un tabellone.
 *
 * Prima ogni turno era una colonna alta uguale alle altre, dentro una scheda
 * stretta: quarti, semifinali e finale sembravano tre elenchi affiancati e
 * non un percorso. Qui le colonne hanno lo stesso disegno di un tabellone da
 * mondiali - ogni turno ha meta' delle sfide del precedente, e le sfide si
 * distribuiscono in verticale in modo che ognuna stia all'altezza delle due
 * da cui nasce. Il collegamento lo fa il CSS, non un disegno.
 */
function Eliminazione({ turni }) {
  const principali = turni.filter((t) => !t.consolazione)
  const consolazione = turni.filter((t) => t.consolazione)
  return (
    <>
      <div className="tab-ko" style={{ '--colonne': principali.length }}>
        {principali.map((t, col) => (
          <div key={t.titolo} className="ko-turno">
            <h4>{t.titolo}</h4>
            <div className="ko-sfide">
              {t.sfide.map((s, i) => (
                <div key={i} className={`ko-cella${col < principali.length - 1 ? ' con-tratto' : ''}`}>
                  <Sfida s={s} verbo={col === principali.length - 1 ? 'vince' : 'passa'} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {consolazione.map((t) => (
        <div key={t.titolo} className="ko-consolazione">
          <h4>{t.titolo}</h4>
          {/* onestà: questa gara la mette Fantapazz, non il regolamento */}
          <p className="nota-turno">
            Fra le due perdenti delle semifinali. Il regolamento non prevede una
            finale per il terzo posto: le eliminate vanno in Conference.
          </p>
          {t.sfide.map((s, i) => <Sfida key={i} s={s} verbo="vince" />)}
        </div>
      ))}
    </>
  )
}

/** Un girone: le giornate una dopo l'altra, senza nessuno che «passa». */
function Gironi({ turni }) {
  return (
    <div className={turni.length > 5 ? 'tabellone lungo' : 'tabellone'}>
      {turni.map((t) => (
        <div key={t.titolo} className="turno">
          <h4>{t.titolo}</h4>
          {t.sfide.map((s, i) => <Sfida key={i} s={s} girone />)}
        </div>
      ))}
    </div>
  )
}

function Tabellone({ coppa }) {
  if (!coppa) return null
  if (coppa.classifica) return <Classifica righe={coppa.classifica} />
  const turni = tabelloneDi(coppa)
  if (!turni.length) return null
  /* Il tabellone si disegna solo dove c'e' davvero un'eliminazione. Nei gironi
     le giornate non si restringono, e metterle in colonne affiancate direbbe
     una cosa falsa sulla forma della competizione. */
  const aGironi = turni.some((t) => t.girone)
  return aGironi ? <Gironi turni={turni} /> : <Eliminazione turni={turni} />
}

export default function Coppe() {
  const anni = useArchivio('stagioni', stagioni)
  const elenco = (anni.dati ?? []).map((s) => s.id)
  /* Non l'ultima in elenco: l'ultima **giocata**. Una stagione che deve
     ancora cominciare non ha coppe da mostrare. */
  const ultimaGiocata = (anni.dati ?? []).find((s) => s.conclusa)?.id
  const [scelta, setScelta] = useState('')
  const stagione = scelta || ultimaGiocata || elenco[0] || ''
  /* Una competizione alla volta. Nove tabelloni tutti aperti sono nove schede
     strette in cui nessuno legge niente: la scelta viene prima. */
  const [coppa, setCoppa] = useState(COPPE[0].id)

  const co = useArchivio(['coppeStagione', stagione],
    () => (stagione ? coppeStagione(stagione) : Promise.resolve([])), [stagione])
  const al = useArchivio('albo', albo)
  const cl = useArchivio(['classifica', stagione],
    () => (stagione ? classifica(stagione) : Promise.resolve([])), [stagione])

  const campione = getTeam((cl.dati ?? []).find((r) => r.posizione === 1)?.societa)

  /* L'albo d'oro di ogni competizione, gia' pronto da leggere. */
  const alboPerCoppa = useMemo(() => {
    const m = new Map()
    for (const r of al.dati ?? []) {
      if (!m.has(r.competizione)) m.set(r.competizione, [])
      m.get(r.competizione).push(r)
    }
    for (const righe of m.values()) righe.sort((a, b) => b.stagione.localeCompare(a.stagione))
    return m
  }, [al.dati])

  const perId = useMemo(() => new Map((co.dati ?? []).map((c) => [c.id, c])), [co.dati])
  const trofei = COPPE.map((c) => ({ scheda: c, dati: c.dati ? perId.get(c.dati) ?? null : null }))
  const vinte = trofei.filter((t) => t.dati?.vincitore)
  const aiFantapunti = vinte.filter((t) => t.dati.aiFantapunti)
  const contese = trofei.filter((t) => t.dati?.finaleInParita)

  return (
    <Pagina className="page container wide">
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
            const righe = alboPerCoppa.get(c.dati) ?? []
            if (!righe.length) return null
            const conta = new Map()
            for (const r of righe) conta.set(r.vincitore, (conta.get(r.vincitore) ?? 0) + 1)
            const ordinati = [...conta.entries()].sort((a, b) => b[1] - a[1])
            const massimo = ordinati[0]?.[1] ?? 0
            const recordman = ordinati.filter(([, n]) => n === massimo && n > 1)
              .map(([team, n]) => ({ team, n }))
            const edizioni = righe.length
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
                      {r.ai_fantapunti && <span className="dettaglio">ai fantapunti</span>}
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

      <section className="block">
        <h2 className="section-title">I tabelloni</h2>
        <Barra>
          <Campo etichetta="Stagione">
            <select value={stagione} onChange={(e) => setScelta(e.target.value)}>
              {elenco.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Campo>
          <Gruppo etichetta="Competizione" ora={coppa} scegli={setCoppa}
                  voci={trofei.map(({ scheda, dati }) =>
                    [scheda.id, scheda.nome, dati?.vincitore ? '★' : undefined])} />
        </Barra>

        {(() => {
          const t = trofei.find((x) => x.scheda.id === coppa)
          if (!t) return null
          const { scheda: c, dati } = t
          return (
            <article className="coppa card sola" style={{ '--accent': c.colore }}>
              <header>
                <h2>{c.nome}</h2>
                {c.novita && <span className="novita">nuova · {c.novita}</span>}
                {dati?.vincitore && <span className="attiva">{stagione} · vinta</span>}
              </header>
              <p className="formula">{c.formula}</p>
              {c.note && <p className="nota-coppa">{c.note}</p>}

              {dati
                ? <Tabellone coppa={dati} />
                : <p className="nota-coppa">
                    Nel {stagione} questa competizione non si è giocata, oppure
                    l'archivio non ne ha le partite.
                  </p>}

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
          )
        })()}
      </section>

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
    </Pagina>
  )
}
