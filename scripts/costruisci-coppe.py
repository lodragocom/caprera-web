#!/usr/bin/env python3
"""
Costruisce cups.json: tabelloni e albo d'oro di tutte le coppe, tutte le stagioni.

Legge src/data/lineups/*.json, che gia' contiene i turni di coppa con societa'
normalizzate, gol e fantapunti (li produce costruisci-formazioni.py dalle
pagine "In campo" di Fantapazz). Da li' ricava chi ha vinto cosa.

Due regole del regolamento Caprera che qui diventano codice:
  - in gara secca, a parita' di gol vince chi ha piu' fantapunti;
  - il turno "Finali" contiene la finale e la finale 3°/4° posto, in
    quest'ordine: il trofeo lo assegna la prima.
"""

import glob
import json
import os
import re

QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(QUI)
DATI = os.path.join(REPO, "src", "data")

# prefisso del turno su Fantapazz -> (id, nome per esteso)
COMPETIZIONI = [
    ("Coppa Italia", "coppa-italia", "Coppa Italia"),
    ("Qualificazione Champions League", "qualificazione-champions", "Qualificazione Champions"),
    ("Qualificazione Champions", "qualificazione-champions", "Qualificazione Champions"),
    ("Champions League", "champions", "Champions League"),
    ("Europa League", "europa-league", "Europa League"),
    ("Conference League", "conference-league", "Conference League"),
    ("Supercoppa Italiana", "supercoppa-italiana", "Supercoppa Italiana"),
    ("Supercoppa Europea", "supercoppa-europea", "Supercoppa Europea"),
]

ORDINE = ["coppa-italia", "qualificazione-champions", "champions",
          "europa-league", "conference-league", "supercoppa-italiana",
          "supercoppa-europea"]


def competizione(turno):
    """Dal nome del turno ricava la competizione e il nome del turno stesso."""
    for prefisso, cid, nome in COMPETIZIONI:
        if turno.startswith(prefisso):
            resto = turno[len(prefisso):].lstrip(" -").strip()
            return cid, nome, (resto or "Turno unico")
    return None, None, turno


# competizione a girone che non assegna un trofeo: serve solo a distribuire
# le societa' fra Champions ed Europa League
SENZA_TROFEO = {"qualificazione-champions"}


def vincitore(partite):
    """Chi vince la finale: una gara secca o due, andata e ritorno.

    Decidono i gol complessivi; a parita' i fantapunti complessivi, come
    prevede il regolamento per la gara secca. Se anche quelli sono pari non
    c'e' criterio e restituiamo None invece di inventarne uno.
    """
    gol, fp = {}, {}
    for p in partite:
        for casa, altro, g, f in (("casa", "fuori", "golCasa", "fpCasa"),
                                  ("fuori", "casa", "golFuori", "fpFuori")):
            s = p[casa]
            gol[s] = gol.get(s, 0) + p[g]
            fp[s] = fp.get(s, 0) + p[f]
    if len(gol) != 2:
        return None
    a, b = gol
    if gol[a] != gol[b]:
        return a if gol[a] > gol[b] else b
    if fp[a] != fp[b]:
        return a if fp[a] > fp[b] else b
    return None


def finale_di(turni):
    """Le partite che assegnano il trofeo, comunque sia stato chiamato il turno.

    In dieci stagioni il tabellone ha cambiato forma tre volte:
      - "Finali": una gara secca (la seconda partita e' la finale 3°/4°);
      - "Finali Andata" + "Finali Ritorno": finale su due gare;
      - solo "Giornata N": le ultime due giornate sono la finale andata e
        ritorno, e si riconoscono perche' oppongono le stesse due societa'.
    """
    finali = [t for t in turni if re.match(r"final[ei]", t["turno"].strip(), re.I)
              and t["partite"]]
    if finali:
        return [t["partite"][0] for t in finali]

    giornate = [t for t in turni if re.match(r"giornata", t["turno"].strip(), re.I)
                and t["partite"]]
    if len(giornate) >= 2:
        a, b = giornate[-2]["partite"][0], giornate[-1]["partite"][0]
        if {a["casa"], a["fuori"]} == {b["casa"], b["fuori"]}:
            return [a, b]
        return [b]
    return []


def _pari_nei_gol(partite):
    """Vero se la finale, su una o due gare, e' finita in parita' nei gol."""
    gol = {}
    for p in partite:
        gol[p["casa"]] = gol.get(p["casa"], 0) + p["golCasa"]
        gol[p["fuori"]] = gol.get(p["fuori"], 0) + p["golFuori"]
    return len(set(gol.values())) == 1


def classifica_fantapunti(d):
    """La Classifica Fantapunti di una stagione.

    E' la somma dei fantapunti di campionato **senza il +1 di chi gioca in
    casa**: quel punto premia il fattore campo, non la squadra, e in questa
    graduatoria non conta. Verificato sul 2025-26 contro la classifica
    pubblicata da Fantapazz: dieci societa' su dieci, allo stesso decimale.
    """
    fp = {}
    for t in d.get("giornate", []):
        for p in t["partite"]:
            casa = next((m["valore"] or 0 for m in p["lati"][0]["modificatori"]
                         if "casa" in m["nome"].lower()), 0)
            fp[p["casa"]] = fp.get(p["casa"], 0) + p["fpCasa"] - casa
            fp[p["fuori"]] = fp.get(p["fuori"], 0) + p["fpFuori"]
    return sorted(((s, round(v, 2)) for s, v in fp.items()), key=lambda x: -x[1])


def snello(p):
    """La partita senza formazioni: cups.json deve restare leggero."""
    return {k: p[k] for k in ("casa", "fuori", "golCasa", "golFuori", "fpCasa", "fpFuori")}


def main():
    with open(os.path.join(DATI, "standings.json"), encoding="utf-8") as f:
        classifiche = json.load(f)

    stagioni, albo, aperti = [], {}, []

    for path in sorted(glob.glob(os.path.join(DATI, "lineups", "*.json"))):
        with open(path, encoding="utf-8") as f:
            d = json.load(f)
        stagione = d["stagione"]

        # raggruppa i turni per competizione, mantenendo l'ordine di gioco
        per_coppa = {}
        for t in d.get("coppe", []):
            cid, nome, turno = competizione(t["turno"])
            if cid is None:
                aperti.append(f"{stagione}: turno non riconosciuto {t['turno']!r}")
                continue
            c = per_coppa.setdefault(cid, {"id": cid, "nome": nome, "turni": []})
            c["turni"].append({"turno": turno,
                               "partite": [snello(p) for p in t["partite"]]})

        coppe = []
        for cid in ORDINE:
            c = per_coppa.get(cid)
            if not c:
                continue
            finale = [] if cid in SENZA_TROFEO else finale_di(c["turni"])
            vinc = finalista = None
            ai_fantapunti = False
            if finale:
                vinc = vincitore(finale)
                squadre = {finale[0]["casa"], finale[0]["fuori"]}
                if vinc:
                    finalista = next(s for s in squadre if s != vinc)
                    ai_fantapunti = (sum(p["golCasa"] for p in finale)
                                     == sum(p["golFuori"] for p in finale)
                                     if len(finale) == 1 else
                                     _pari_nei_gol(finale))
                else:
                    aperti.append(f"{c['nome']} {stagione}: finale pari anche "
                                  f"nei fantapunti fra {' e '.join(sorted(squadre))}")
            coppe.append({**c, "stagione": stagione, "vincitore": vinc,
                          "finalista": finalista, "aiFantapunti": ai_fantapunti,
                          "gareFinale": len(finale),
                          "finaleInParita": bool(finale and vinc is None)})
            if vinc:
                albo.setdefault(cid, []).append(
                    {"stagione": stagione, "nome": c["nome"], "vincitore": vinc,
                     "finalista": finalista, "aiFantapunti": ai_fantapunti})

        # La Classifica Fantapunti e' un trofeo a tutti gli effetti (§5.3), ma
        # non ha partite: si ricava dai fantapunti di campionato.
        fp = classifica_fantapunti(d)
        if fp:
            coppe.insert(0, {
                "id": "fantapunti", "nome": "Classifica Fantapunti",
                "stagione": stagione, "vincitore": fp[0][0],
                "finalista": fp[1][0] if len(fp) > 1 else None,
                "aiFantapunti": False, "finaleInParita": False,
                "gareFinale": 0, "turni": [],
                "classifica": [{"team": s, "fantapunti": v} for s, v in fp],
            })
            albo.setdefault("fantapunti", []).append(
                {"stagione": stagione, "nome": "Classifica Fantapunti",
                 "vincitore": fp[0][0], "finalista": fp[1][0] if len(fp) > 1 else None,
                 "aiFantapunti": False})

        tabella = classifiche.get(stagione) or []
        stagioni.append({
            "stagione": stagione,
            "campione": tabella[0]["team"] if tabella else None,
            "coppe": coppe,
        })

    ultima = stagioni[-1]
    fuori = {
        # comodita' per il front-end: l'ultima stagione e' quella che si mostra
        # per prima quasi ovunque
        "stagione": ultima["stagione"],
        "campione": ultima["campione"],
        "coppe": ultima["coppe"],
        "stagioni": stagioni,
        "albo": albo,
        "daChiarire": aperti,
    }

    path = os.path.join(DATI, "cups.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(fuori, f, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    print(f"  -> src/data/cups.json  ({os.path.getsize(path)/1024:.0f} KB)")
    print(f"     {len(stagioni)} stagioni\n")

    larghezza = max(len(n) for _, _, n in COMPETIZIONI)
    for s in stagioni:
        print(f"  {s['stagione']}   campionato: {s['campione']}")
        for c in s["coppe"]:
            if c["id"] in SENZA_TROFEO:
                continue
            v = c["vincitore"] or "— da assegnare"
            nota = "  (ai fantapunti)" if c["aiFantapunti"] else ""
            print(f"      {c['nome']:<{larghezza}}  {v}{nota}")
        print()

    if aperti:
        print("DA CHIARIRE:")
        for a in aperti:
            print("  !", a)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
