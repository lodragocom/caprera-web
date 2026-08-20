#!/usr/bin/env python3
"""
Applica i risultati estratti da Fantapazz ai JSON del sito.

I CSV in data-src/risultati/ sono la nostra estrazione delle pagine
"Calendario competizione" di Fantapazz (vedi caprera-dati/PROGRAMMI/
importa-calendario-fantapazz.py). Stanno dentro il repo e non nella cartella
sorgenti della Presidenza perche' li produciamo noi: cosi' chiunque cloni il
progetto puo' rigenerare gli stessi JSON.

Cosa fa:
  1. sovrascrive i risultati di campionato dentro matches.json
     (le giornate del 2025-26 erano gia' in calendario ma senza punteggi);
  2. ricalcola standings.json e i totali di summary.json;
  3. genera cups.json con i tabelloni delle coppe e l'albo d'oro.

Puo' girare da solo (`python3 scripts/applica-risultati.py`) oppure essere
richiamato in coda a build-data.py.
"""

import csv
import glob
import json
import os
import re

QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(QUI)
RISULTATI = os.path.join(REPO, "data-src", "risultati")
DATI = os.path.join(REPO, "src", "data")

# codice Fantapazz -> id societa' usato dal sito
ID = {
    "ARR": "armata-rossa", "AVL": "aston-ville", "DSP": "disperata",
    "PRS": "prosecco", "RMO": "real-monghi", "ROB": "roburro",
    "SAM": "sanguemisto", "SMT": "smit", "MGP": "sporting-mangiapreti",
    "SUB": "subbuteo", "LLD": "casata-draghi",
}

# ordine di visualizzazione e nomi leggibili delle competizioni
COPPE = [
    ("coppa-italia", "Coppa Italia"),
    ("qualificazione-champions", "Qualificazione Champions League"),
    ("champions", "Champions League"),
    ("europa-league", "Europa League"),
    ("conference-league", "Conference League"),
    ("supercoppa-italiana", "Supercoppa Italiana"),
    ("supercoppa-europea", "Supercoppa Europea"),
]


def leggi(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def carica():
    out = {}
    for path in sorted(glob.glob(os.path.join(RISULTATI, "risultati_*.csv"))):
        for r in leggi(path):
            r["GolCasa"] = int(r["GolCasa"])
            r["GolFuori"] = int(r["GolFuori"])
            r["FPCasa"] = float(r["FPCasa"])
            r["FPFuori"] = float(r["FPFuori"])
            r["Casa"] = ID[r["Casa"]]
            r["Fuori"] = ID[r["Fuori"]]
            out.setdefault((r["Stagione"], r["Competizione"]), []).append(r)
    return out


# ------------------------------------------------------------------ campionato
def applica_campionato(matches, righe):
    """Riempie i punteggi delle giornate gia' presenti in matches.json.

    L'accoppiamento e' su (stagione, giornata, casa, trasferta): il calendario
    del sito e quello di Fantapazz sono lo stesso calendario, quindi se qualcosa
    non combacia e' un errore e va segnalato, non ignorato.
    """
    indice = {}
    for i, m in enumerate(matches):
        indice[(m["season"], m["round"], m["home"], m["away"])] = i

    applicati, mancanti = 0, []
    for r in righe:
        giornata = int(re.search(r"\d+", r["Turno"]).group())
        chiave = (r["Stagione"], giornata, r["Casa"], r["Fuori"])
        i = indice.get(chiave)
        if i is None:
            mancanti.append(chiave)
            continue
        matches[i].update({
            "homeGoals": r["GolCasa"], "awayGoals": r["GolFuori"],
            "homeFp": r["FPCasa"], "awayFp": r["FPFuori"], "played": True,
        })
        applicati += 1
    return applicati, mancanti


def classifica(matches, stagione):
    t = {}
    for m in matches:
        if m["season"] != stagione or not m["played"]:
            continue
        for lato, altro in (("home", "away"), ("away", "home")):
            tid = m[lato]
            r = t.setdefault(tid, {
                "team": tid, "played": 0, "won": 0, "drawn": 0, "lost": 0,
                "goalsFor": 0, "goalsAgainst": 0, "points": 0, "fantapoints": 0.0,
            })
            gf, ga = m[lato + "Goals"], m[altro + "Goals"]
            r["played"] += 1
            r["goalsFor"] += gf
            r["goalsAgainst"] += ga
            if m[lato + "Fp"] is not None:
                r["fantapoints"] += m[lato + "Fp"]
            if gf > ga:
                r["won"] += 1; r["points"] += 3
            elif gf == ga:
                r["drawn"] += 1; r["points"] += 1
            else:
                r["lost"] += 1

    tabella = list(t.values())
    for r in tabella:
        r["goalDiff"] = r["goalsFor"] - r["goalsAgainst"]
        r["fantapoints"] = round(r["fantapoints"], 2)
    tabella.sort(key=lambda r: (-r["points"], -r["goalDiff"], -r["goalsFor"],
                                -r["fantapoints"]))
    for i, r in enumerate(tabella, 1):
        r["position"] = i
    return tabella


# ----------------------------------------------------------------------- coppe
def vincitore(r):
    """Chi passa il turno in gara secca.

    A parita' di gol decidono i fantapunti, come prevede il regolamento.
    Fantapazz si ferma al risultato in gol e non dichiara una vincente, quindi
    il pareggio va sciolto qui. Se anche i fantapunti sono identici non c'e'
    criterio: restituiamo None e lo segnaliamo invece di inventarne uno.
    """
    if r["GolCasa"] != r["GolFuori"]:
        return r["Casa"] if r["GolCasa"] > r["GolFuori"] else r["Fuori"]
    if r["FPCasa"] != r["FPFuori"]:
        return r["Casa"] if r["FPCasa"] > r["FPFuori"] else r["Fuori"]
    return None


def tabellone(righe):
    """Raggruppa le partite per turno, mantenendo l'ordine di gioco."""
    turni, ordine = {}, []
    for r in righe:
        chiave = r["Turno"] or "Turno unico"
        if chiave not in ordine:
            ordine.append(chiave)
        turni.setdefault(chiave, []).append({
            "girone": r["Girone"] or None,
            "data": r["Data"],
            "home": r["Casa"], "away": r["Fuori"],
            "homeGoals": r["GolCasa"], "awayGoals": r["GolFuori"],
            "homeFp": r["FPCasa"], "awayFp": r["FPFuori"],
        })
    return [{"turno": t, "partite": turni[t]} for t in ordine]


def finale(righe):
    """La partita che assegna il trofeo, se c'e'."""
    for r in righe:
        if re.fullmatch(r"finale", r["Turno"].strip(), re.I):
            return r
    # coppe a girone unico: nessuna finale
    return None


def costruisci_coppe(dati, stagione, tabella_campionato):
    coppe, aperti = [], []

    for cid, nome in COPPE:
        righe = dati.get((stagione, cid))
        if not righe:
            continue
        f = finale(righe)
        vinc, finalista, ai_fantapunti = None, None, False
        if f:
            vinc = vincitore(f)
            finalista = f["Fuori"] if vinc == f["Casa"] else f["Casa"]
            ai_fantapunti = bool(vinc and f["GolCasa"] == f["GolFuori"])
            if vinc is None:
                aperti.append(
                    f"{nome} {stagione}: finale {f['Casa']} {f['GolCasa']}-"
                    f"{f['GolFuori']} {f['Fuori']}, pari anche nei fantapunti "
                    f"({f['FPCasa']}): vincitore da stabilire"
                )
        coppe.append({
            "id": cid, "nome": nome, "stagione": stagione,
            "vincitore": vinc,
            "finalista": finalista if vinc else None,
            # vinta ai fantapunti dopo un pareggio: va detto, e' un'informazione
            "aiFantapunti": ai_fantapunti,
            "finaleInParita": bool(f and vinc is None),
            "turni": tabellone(righe),
        })

    return {
        "stagione": stagione,
        "campione": tabella_campionato[0]["team"] if tabella_campionato else None,
        "coppe": coppe,
        "daChiarire": aperti,
    }


def main():
    dati = carica()
    if not dati:
        raise SystemExit(f"Nessun CSV in {RISULTATI}")

    with open(os.path.join(DATI, "matches.json"), encoding="utf-8") as f:
        matches = json.load(f)
    with open(os.path.join(DATI, "standings.json"), encoding="utf-8") as f:
        standings = json.load(f)
    with open(os.path.join(DATI, "summary.json"), encoding="utf-8") as f:
        summary = json.load(f)

    stagioni = sorted({s for s, c in dati if c == "campionato"})
    for stagione in stagioni:
        n, mancanti = applica_campionato(matches, dati[(stagione, "campionato")])
        print(f"  campionato {stagione}: {n} risultati applicati")
        for k in mancanti:
            print(f"    ! partita non trovata in calendario: {k}")
        standings[stagione] = classifica(matches, stagione)
        for r in standings[stagione][:3]:
            print(f"    {r['position']}. {r['team']:<22} {r['points']} pt")

    ultima = stagioni[-1]
    coppe = costruisci_coppe(dati, ultima, standings.get(ultima, []))

    giocate = [m for m in matches if m["played"]]
    summary["lastPlayedSeason"] = ultima
    summary["totals"]["matches"] = len(giocate)
    summary["totals"]["goals"] = sum(m["homeGoals"] + m["awayGoals"] for m in giocate)
    summary["palmares"] = [
        {"season": s, "team": standings[s][0]["team"], "points": standings[s][0]["points"]}
        for s in sorted(standings, reverse=True) if standings.get(s)
    ]
    # stagione conclusa: non c'e' piu' una prossima giornata da mostrare
    restanti = [m for m in matches if m["season"] == ultima and not m["played"]]
    summary["nextRound"] = None if not restanti else summary.get("nextRound")

    for nome, payload in (("matches.json", matches), ("standings.json", standings),
                          ("summary.json", summary), ("cups.json", coppe)):
        path = os.path.join(DATI, nome)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, separators=(",", ":"),
                      allow_nan=False)
        print(f"  -> src/data/{nome}  ({os.path.getsize(path)/1024:.0f} KB)")

    if coppe["daChiarire"]:
        print("\nDA CHIARIRE CON LA PRESIDENZA:")
        for x in coppe["daChiarire"]:
            print(f"  ! {x}")


if __name__ == "__main__":
    main()
