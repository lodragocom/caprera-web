import { Link } from 'react-router-dom'
import { Pagina } from '../components/moto'
import './Legale.css'

/**
 * I termini d'uso.
 *
 * Il regolamento sportivo sta altrove ed è un'altra cosa: quello dice come si
 * gioca, questo dice come si sta su questo sito. Tenerli separati evita che
 * una modifica al gioco sembri una modifica ai patti, e viceversa.
 */
export default function Termini() {
  return (
    <Pagina className="legale">
      <p className="legale-occhiello">Federazione Caprera</p>
      <h1>Termini</h1>
      <p className="legale-data">In vigore dal 30 agosto 2026</p>

      <p className="legale-guida">
        Questa pagina riguarda il <strong>sito</strong>. Come si gioca lo dice il{' '}
        <Link to="/regolamento">Regolamento della Federazione</Link>, che è un’altra cosa
        e vale per conto suo.
      </p>

      <h2>Cos’è questo sito</h2>
      <p>
        L’archivio e l’area riservata della <strong>Federazione Caprera</strong>, una lega
        di fantacalcio fra amici attiva dal 2016. Le pagine pubbliche — classifica,
        risultati, albo d’oro, rose — le può leggere chiunque. L’area riservata è per chi
        ha una Tessera del Tifoso.
      </p>
      <p className="legale-nota">
        Non è un servizio commerciale, non si paga per entrare, e non è affiliato a
        Fantapazz, alla Lega Serie A o alla FIGC.
      </p>

      <h2>La Tessera</h2>
      <ul>
        <li>
          <strong>La società non si sceglie: la assegna la Presidenza.</strong> Ti viene
          intestata una tessera sulla tua email, e al primo accesso si attiva.
        </li>
        <li>
          <strong>La password è tua e non la conosciamo.</strong> Se la perdi si rifà
          dalla pagina d’accesso; tenerla al sicuro tocca a te.
        </li>
        <li>
          <strong>L’accesso è personale.</strong> Chi entra col tuo accesso vede le tue
          cose: contratti, crediti, formazioni. Non prestarlo.
        </li>
        <li>
          Un’email senza tessera ha un account e nessuna società. Non è un guasto: è chi
          si è registrato prima che la Presidenza gliela desse.
        </li>
      </ul>

      <h2>Cosa non si fa</h2>
      <ul>
        <li>Entrare con l’accesso di un altro, o provare a leggere dati che non sono tuoi.</li>
        <li>Scaricare l’archivio in massa con programmi automatici.</li>
        <li>Mettere nei campi liberi — soprannome per primo — insulti o roba altrui.</li>
        <li>Tentare di forzare il sito. Se trovi una falla, <strong>scrivicelo</strong>: è
        più utile a tutti, e la ringraziamo.</li>
      </ul>

      <h2>I dati della lega</h2>
      <p>
        Risultati, formazioni e classifiche sono <strong>la memoria della lega</strong>, e
        restano anche se qualcuno se ne va: sono partite giocate, non informazioni
        personali. I voti dei calciatori arrivano da Fantapazz e appartengono a chi li
        produce; qui servono a calcolare le nostre partite e nient’altro.
      </p>

      <h2>Quello che non possiamo promettere</h2>
      <p>
        Il sito è offerto <strong>così com’è</strong>. È fatto con cura e collaudato, ma
        può avere errori, può essere fermo per manutenzione, e un dato d’archivio può
        risultare sbagliato. Quando succede si corregge.
      </p>
      <p>
        <strong>Il riferimento per le decisioni della lega resta la Presidenza</strong>, non
        una schermata: se il sito dice una cosa e il regolamento un’altra, vale il
        regolamento.
      </p>

      <h2>Se cambia qualcosa</h2>
      <p>
        Queste condizioni possono cambiare quando cambia il sito. Se cambia qualcosa che
        conta, lo diciamo — non lo nascondiamo in una data aggiornata in silenzio.
      </p>

      <h2>Scriverci</h2>
      <p>
        <a href="mailto:info@federazionecaprera.com">info@federazionecaprera.com</a>.
        Come trattiamo i tuoi dati sta nella <Link to="/privacy">Privacy</Link>.
      </p>
    </Pagina>
  )
}
