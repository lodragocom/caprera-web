import './Filtri.css'

/*
 * I filtri e le schede, uguali su tutte le pagine che elencano qualcosa.
 *
 * Non e' un capriccio grafico: due barre diverse costringono chi legge a
 * reimparare dove si clicca ogni volta che cambia pagina. Il disegno e' quello
 * che RosaSocieta gia' aveva - e' il piu' completo, perche' e' l'unico con le
 * schede in testa - portato fuori cosi' com'e'.
 */

/** La riga dei filtri. Ci si mettono dentro Campo, Gruppo e quello che serve. */
export function Barra({ children }) {
  return <div className="fl-barra">{children}</div>
}

/** Un campo con la sua etichetta: una select, un input, quello che passi. */
export function Campo({ etichetta, cerca, children }) {
  return (
    <label className={`fl-campo${cerca ? ' fl-cerca' : ''}`}>
      <span>{etichetta}</span>
      {children}
    </label>
  )
}

/** La ricerca, che e' sempre la stessa e non ha motivo di essere riscritta. */
export function Cerca({ valore, cambia, etichetta = 'Cerca', invito = 'Calciatore o club…' }) {
  return (
    <Campo etichetta={etichetta} cerca>
      <input type="search" placeholder={invito} value={valore}
             onChange={(e) => cambia(e.target.value)} />
    </Campo>
  )
}

/**
 * Un gruppo di bottoni che si escludono - i ruoli, i due momenti della rosa.
 *
 * `voci` e' una lista di [valore, etichetta] oppure [valore, etichetta, conto]:
 * il terzo elemento, quando c'e', compare piccolo accanto al nome.
 */
export function Gruppo({ voci, ora, scegli, etichetta }) {
  return (
    <div className="fl-gruppo" role="group" aria-label={etichetta}>
      {voci.map(([v, l, n]) => (
        <button key={v} type="button" className={ora === v ? 'on' : ''}
                onClick={() => scegli(v)}>
          {l}{n != null && <i>{n}</i>}
        </button>
      ))}
    </div>
  )
}

/** Le schede in testa: il riassunto prima del dettaglio. */
export function Schede({ children }) {
  return <div className="fl-schede">{children}</div>
}

export function Scheda({ etichetta, valore, sotto }) {
  return (
    <div className="fl-scheda">
      <span className="fl-et">{etichetta}</span>
      <b>{valore}</b>
      {sotto && <span className="fl-sotto">{sotto}</span>}
    </div>
  )
}

/** «quanti ne vedi», sotto i filtri e sopra la tabella. */
export function Conto({ children }) {
  return <p className="fl-conto">{children}</p>
}

/** L'avviso col filetto d'oro: quello che il lettore deve sapere per fidarsi. */
export function Avviso({ children }) {
  return <p className="fl-avviso">{children}</p>
}
