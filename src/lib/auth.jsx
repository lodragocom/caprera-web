import { createContext, useContext, useMemo, useState } from 'react'

/**
 * Sessione del mister.
 *
 * ANTEPRIMA: non c'e' ancora autenticazione vera. Si sceglie la propria
 * societa' da un elenco e si entra, senza password. Serve a provare la
 * struttura dell'area riservata prima di collegarla a Supabase.
 *
 * Quando arrivera' l'autenticazione vera, cambia solo questo file:
 * `entra()` diventera' una chiamata a signInWithOtp / signInWithPassword e
 * `sessione.team` verra' dal profilo dell'utente, non da una scelta.
 *
 * Lo stato e' tenuto in memoria e non persiste al refresh: e' voluto, cosi'
 * non si crea l'illusione di una sessione reale.
 */
const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [sessione, setSessione] = useState(null)

  const valore = useMemo(
    () => ({
      sessione,
      anteprima: true,
      entra: (teamId, nomeMister) =>
        setSessione({ team: teamId, mister: nomeMister || null }),
      esci: () => setSessione(null),
    }),
    [sessione]
  )

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth va usato dentro <AuthProvider>')
  return v
}
