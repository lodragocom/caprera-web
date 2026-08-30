import { Link } from 'react-router-dom'
import { apriConsenso } from '../lib/consenso'
import { Pagina } from '../components/moto'
import './Legale.css'

/**
 * L'informativa privacy.
 *
 * Non è copiata da un modello: dice quello che questo sistema fa davvero, ed è
 * stata scritta guardando le tabelle. Se il sistema cambia — un campo nuovo,
 * un servizio nuovo — questa pagina va cambiata con lui, altrimenti diventa
 * la cosa peggiore che un'informativa possa essere: precisa e falsa.
 */
export default function Privacy() {
  return (
    <Pagina className="legale">
      <p className="legale-occhiello">Federazione Caprera</p>
      <h1>Privacy</h1>
      <p className="legale-data">In vigore dal 30 agosto 2026</p>

      <p className="legale-guida">
        In breve: per giocare servono la tua email e poco altro. Non vendiamo niente a
        nessuno, non c’è profilazione dei mister, e tutto sta su server europei. Sotto
        c’è il dettaglio, scritto per essere letto.
      </p>

      <h2>Chi tratta i dati</h2>
      <p>
        Il titolare è <strong>Salvatore Lo Drago</strong>, che gestisce il sito e
        l’archivio della Federazione Caprera. Per qualsiasi cosa:{' '}
        <a href="mailto:info@federazionecaprera.com">info@federazionecaprera.com</a>.
      </p>
      <p className="legale-nota">
        La Federazione Caprera è una lega di fantacalcio fra amici, non un ente
        registrato: risponde una persona, non una società.
      </p>

      <h2>Cosa raccogliamo, e perché</h2>
      <table className="legale-tab">
        <thead><tr><th>Dato</th><th>Perché</th><th>Chi lo vede</th></tr></thead>
        <tbody>
          <tr>
            <td>Email</td>
            <td>È il nome con cui entri, e l’indirizzo a cui la Federazione ti scrive</td>
            <td>Tu e la Presidenza</td>
          </tr>
          <tr>
            <td>Password</td>
            <td>Per entrare</td>
            <td><strong>Nessuno.</strong> È cifrata, non la conosciamo nemmeno noi</td>
          </tr>
          <tr>
            <td>Nome e cognome</td>
            <td>Per sapere chi guida quale società</td>
            <td>Tu e la Presidenza</td>
          </tr>
          <tr>
            <td>Soprannome</td>
            <td>È il nome con cui compari nelle cronache e nei tabelloni</td>
            <td><strong>Chiunque</strong> — è pubblico per sua natura</td>
          </tr>
          <tr>
            <td>Telefono</td>
            <td>Per raggiungerti quando serve, la sera dell’asta</td>
            <td>Tu e la Presidenza</td>
          </tr>
          <tr>
            <td>Link della videochiamata</td>
            <td>La stanza da cui ti colleghi all’asta</td>
            <td>Tu e la Presidenza</td>
          </tr>
          <tr>
            <td>Indirizzo IP e data d’accesso</td>
            <td>Registrati automaticamente dai server, servono alla sicurezza</td>
            <td>Nessuno li consulta se non c’è un problema</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Nome, cognome, soprannome, telefono e link sono facoltativi</strong>: il
        sito funziona anche se li lasci vuoti. L’unico dato indispensabile è l’email.
      </p>

      <h2>Una cosa che vale la pena sapere</h2>
      <p>
        Chi vede cosa <strong>non lo decide il sito: lo decide il database</strong>. Ogni
        tabella ha regole che dicono quali righe una persona può leggere, e valgono anche
        se una pagina fosse scritta male. Un mister non può vedere i contratti di un altro
        neanche provandoci: non è una promessa nostra, è come è costruito.
      </p>

      <h2>Su quale base</h2>
      <ul>
        <li>
          <strong>Per farti giocare</strong> — email, password e società: senza, la lega
          non funziona. È l’esecuzione di quello che ci siamo detti.
        </li>
        <li>
          <strong>Perché ci hai acconsentito</strong> — statistiche e social. Solo se hai
          detto di sì, e puoi cambiare idea in ogni momento.
        </li>
        <li>
          <strong>Perché è ragionevole</strong> — i registri tecnici degli accessi, che
          servono a tenere il sito in piedi e sicuro.
        </li>
      </ul>

      <h2>Dove stanno</h2>
      <ul>
        <li><strong>Supabase</strong> — l’archivio e gli accessi. Server nell’Unione Europea.</li>
        <li><strong>Resend</strong> — le email della Federazione. Server in Irlanda.</li>
        <li><strong>Cloudflare</strong> — il sito che stai leggendo.</li>
        <li><strong>Hostpoint</strong> — la posta di <code>@federazionecaprera.com</code>, in Svizzera.</li>
      </ul>
      <p className="legale-nota">
        Se accetti statistiche o social, entrano in gioco anche Google, Meta e TikTok, che
        trattano dati anche fuori dall’Unione Europea. È esattamente il motivo per cui
        quelle due voci si scelgono e le altre no.
      </p>

      <h2>Per quanto</h2>
      <p>
        I dati del tuo accesso restano finché hai un account. Quando la Presidenza elimina
        un accesso, spariscono davvero: scheda, incarichi, collegamento e account, senza
        copie di scorta nascoste. I risultati delle partite invece restano — sono
        l’archivio della lega e non parlano di te come persona, ma di una società.
      </p>

      <h2>Cosa puoi chiedere</h2>
      <p>
        Sapere cosa abbiamo su di te, correggerlo, farlo cancellare, portartelo via, o
        opporti a un trattamento. Si scrive a{' '}
        <a href="mailto:info@federazionecaprera.com">info@federazionecaprera.com</a> e si
        risponde. Nome, soprannome e telefono li puoi già modificare da solo, dalla tua{' '}
        <Link to="/area/tessera">Tessera</Link>.
      </p>
      <p>
        Se pensi che qualcosa non vada e non ti abbiamo dato ascolto, puoi rivolgerti al
        Garante per la protezione dei dati personali.
      </p>

      <h2>Cookie</h2>
      <p>
        Quelli <strong>tecnici</strong> tengono aperta la tua sessione: ricordano chi sei,
        non dove vai, e non si possono spegnere perché senza si verrebbe buttati fuori a
        ogni pagina. Gli altri — statistiche e social —{' '}
        <strong>non partono finché non dici di sì</strong>.
      </p>
      <p>
        <button className="legale-bottone" onClick={apriConsenso}>
          Rivedi le tue scelte sui cookie
        </button>
      </p>

      <h2>Se questa pagina cambia</h2>
      <p>
        Cambierà quando cambia il sistema, non prima. La data in cima dice sempre da quando
        vale quello che stai leggendo.
      </p>
    </Pagina>
  )
}
