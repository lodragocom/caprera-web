import './Regolamento.css'

/**
 * Sintesi del regolamento, dalla versione PDF del 15 agosto 2026 (42 pagine).
 * Non sostituisce il PDF: per i dettagli operativi e le date fa fede quello.
 */
export default function Regolamento() {
  return (
    <div className="page container reg">
      <header className="page-head">
        <p className="eyebrow">Governo Tricolore</p>
        <h1>Regolamento</h1>
        <p className="lede">
          Sintesi della versione del 15 agosto 2026. Per i dettagli operativi e le
          date fa fede il PDF ufficiale della Presidenza.
        </p>
      </header>

      <div className="avviso card">
        <strong>Vale solo ciò che è scritto via email.</strong> Le comunicazioni
        verbali non contano, e WhatsApp serve per chiarezza ma non fa fede. Ogni
        mister è responsabile di scrivere alla Presidenza:{' '}
        <a href="mailto:federazionecaprera@gmail.com">federazionecaprera@gmail.com</a>.
      </div>

      <Sezione titolo="La lega">
        <p>
          Dieci società, attive dal 2016. La quota di iscrizione è aumentata due
          volte, l'ultima con il Referendum del giugno 2025, e finanzia
          interamente i premi. Solo pagamenti tracciabili, niente contante. La
          piattaforma di gioco è FantaPazz.
        </p>
        <p>
          Le riforme con applicazione retroattiva passano per referendum: servono{' '}
          <b>6 voti su 10</b>, e il non-voto conta come NO.
        </p>
      </Sezione>

      <Sezione titolo="Rosa e formazione">
        <p>
          Rosa <b>6-9-9-7</b>: sei portieri (che sono due club di Serie A interi),
          nove difensori, nove centrocampisti, sette attaccanti. Quindici
          panchinari, quattro sostituzioni, niente cambio modulo.
        </p>
        <p className="chicca">
          <b>Clausola Ventura:</b> il 4-2-4 non sarà mai ammissibile.
        </p>
        <Tabella
          titolo="Da fantapunti a gol (dal 2024/25)"
          testate={['Fantapunti', 'Gol']}
          righe={[['68', '1'], ['73', '2'], ['78', '3'], ['83', '4'], ['87', '5'], ['+4 punti', '+1 gol']]}
        />
        <p>
          Sotto 68 per entrambe: 1-0 se c'è uno scarto di almeno 6 punti. Chi gioca
          in casa prende <b>+1</b>, escluse le finali.
        </p>
        <Tabella
          titolo="Bonus difesa (Referendum 06.2025)"
          testate={['Media portiere + 3 migliori difensori', 'Bonus']}
          righe={[['6.00', '0'], ['6.25', '1'], ['6.50', '2'], ['6.75', '3'], ['7.00', '4']]}
        />
      </Sezione>

      <Sezione titolo="Jobs Act — i contratti">
        <p>
          Ogni estate ogni società può mettere sotto contratto <b>tre senior</b>{' '}
          (uno per ruolo D/C/A) più <b>un Under</b>. Dal 2025/26 c'è un tetto
          rigido: <b>3 difensori, 3 centrocampisti, 2 attaccanti</b>. Niente slot
          libero significa niente operazione — vale per i rinnovi, per l'eredità
          del contratto in uno scambio e per le nuove firme.
        </p>
        <ul>
          <li>Durata massima 3 anni; per gli attaccanti 2, e se ne può firmare uno solo ogni due anni.</li>
          <li>Un solo rinnovo all'anno, di 1 o 2 anni (attaccanti: 1).</li>
          <li>I contrattualizzati si riscattano al prezzo FantaPazz scontato: <b>50% difensori, 25% centrocampisti</b>, pieno per gli attaccanti.</li>
          <li>Gli Under si riscattano a <b>1 credito</b> finché restano Under (nati dal 2004 per il 2025/26).</li>
          <li>Chi viene ceduto all'estero è svincolato d'ufficio, con rimborso di metà prezzo.</li>
        </ul>
        <p>
          Ogni nuovo contratto dichiara una <b>Clausola Rescissoria</b>. Alla
          scadenza la società o svincola, o rinnova pagando metà clausola — e a
          quel punto il calciatore diventa contendibile: altre società possono
          dichiarare di pagare la CR intera e si va a buste chiuse.
        </p>
      </Sezione>

      <Sezione titolo="Cura Caprera — i crediti">
        <p>
          Budget: <b>250 crediti</b> più il 50% dei crediti risparmiati l'anno
          prima, più 3 per gli Under, più o meno premi e penalità.
        </p>
        <Tabella
          titolo="Penalità principali"
          testate={['Motivo', 'Crediti']}
          righe={[
            ['Formazione non data (1ª volta)', '-1'],
            ['Formazione non data (2ª)', '-3'],
            ['Formazione non data (dalla 3ª)', '-5'],
            ['Ritardo consegna lista', '-2'],
            ['Logo, stadio o divisa non caricati entro il 1º settembre', '-2'],
            ['Cori razzisti non originali', '-5'],
          ]}
        />
        <Tabella
          titolo="Caprera Etica — alcune voci"
          testate={['Evento', 'Crediti']}
          righe={[
            ['Condotta violenta, ritiro patente, incidente', '-1'],
            ['Scommesse (indagine FIGC)', '-1'],
            ['Scommesse (tribunale FIGC)', '-3'],
            ['Razzismo', '-3'],
            ['Partita venduta, doping, violenza', '-5'],
            ['Omicidio', '-10'],
          ]}
        />
        <Tabella
          titolo="Premi di fine stagione"
          testate={['Riconoscimento', 'Crediti']}
          righe={[
            ["Trofeo Walter Mazzarri (miglior mister)", '10'],
            ['Trofeo Maestro Giampaolo (ultimo)', '-3'],
            ['Fair Play (1º)', '3'],
            ['Fantapunti (1º)', '5'],
            ['Premio Paratici (plusvalenze)', '2'],
            ['Premio Zdenek (rosa migliorata)', '2'],
            ['Pallone d’Oro Caprera (dal 2026/27)', '2'],
            ['Serie A MVP Award in rosa', '2'],
          ]}
        />
      </Sezione>

      <Sezione titolo="L'asta">
        <p>
          Dal 2025/26 <b>niente più liste</b>: si va di asta libera. Estrazione di
          ruolo e ordine di chiamata, poi a turno ogni società nomina un calciatore
          con offerta minima di 1 credito (3 per i portieri). <b>Venti secondi</b>{' '}
          per chiamare, <b>otto</b> per rilanciare.
        </p>
        <p>
          I portieri si completano per primi, a blocchi di due club di Serie A. Le
          buste chiuse sopravvivono solo per risolvere le contese sulle clausole
          rescissorie.
        </p>
        <p>
          L'asta di riparazione è nella prima settimana di febbraio. Da quella
          sessione si può mettere un nuovo acquisto sotto contratto per{' '}
          <b>1,5 anni</b>, se il ruolo ha uno slot libero.
        </p>
      </Sezione>

      <Sezione titolo="Novità 2026/27">
        <ul>
          <li>
            <b>Capology.</b> Si pagano gli stipendi reali della rosa, 1 M€ = 1
            credito, stimati 45-120 crediti. Compensazione: +85 crediti a budget.
            Cambia l'economia della lega: chi ha rose costose viene penalizzato.
          </li>
          <li>
            <b>Squadra Primavera.</b> Fino a 1 D + 1 C + 1 A under 21, gratis,
            first-come-first-served. Schierabili solo se un titolare è infortunato
            o squalificato e non è nemmeno in panchina.
          </li>
          <li>
            <b>Pallone d'Oro Caprera.</b> Dieci candidati con almeno 19 presenze,
            voto 3-2-1 tra le società. Il voto a un proprio calciatore è annullato.
          </li>
          <li>
            <b>Mondiale per Club.</b> Nuova competizione biennale, finanziata da
            un aumento di quota.
          </li>
          <li>
            <b>Assicurazione infortuni obbligatoria</b>, minimo 3 crediti.
          </li>
          <li>
            <b>Risoluzione CR</b> spostata all'inizio dell'asta, non più via email.
          </li>
        </ul>
      </Sezione>

      <p className="fonte">
        Fonte: <i>Regolamento — Campionato, Mercato, Crediti</i>, Governo
        Tricolore, 15 agosto 2026. 42 pagine, con appendice dei DPCM dal 2020/21.
      </p>
    </div>
  )
}

function Sezione({ titolo, children }) {
  return (
    <section className="reg-sez">
      <h2 className="section-title">{titolo}</h2>
      {children}
    </section>
  )
}

function Tabella({ titolo, testate, righe }) {
  return (
    <div className="reg-tab">
      <p className="tab-tit">{titolo}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {testate.map((t, i) => (
                <th key={t} className={i === 0 ? 'left' : undefined}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {righe.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j === 0 ? 'left' : 'num strong'}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
