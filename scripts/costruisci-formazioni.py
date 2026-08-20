#!/usr/bin/env python3
"""
Converte le formazioni estratte da Fantapazz in lineups.json per il sito.

I file grezzi stanno in data-src/formazioni/ e arrivano dalla sezione
"In campo" di Fantapazz (vedi caprera-dati/SPIEGAZIONI/SPIEGAZIONE_Formazioni.md).
Formato di partenza, compatto per non pesare in trasporto:

    {"g": 36, "p": [ {"c","f","gc","gf","fc","ff",
                      "l": [ {"m": mister, "q": quando, "a": avviso,
                              "mod": [[nome, valore]],
                              "g": [[nid, T|R, ruolo, nome, sfida, voto, bonus, fascia]]} ]} ]}

Qui diventa una struttura leggibile dal front-end, con il modulo calcolato
dai ruoli degli undici titolari e i bonus tradotti in parole.
"""

import glob
import json
import os
import re

QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(QUI)
SORGENTI = os.path.join(REPO, "data-src", "formazioni")
DATI = os.path.join(REPO, "src", "data")

# Nome societa' su Fantapazz -> id usato dal sito.
#
# In dieci stagioni le societa' hanno cambiato nome di continuo: sono 28
# etichette diverse per 11 societa'. La tabella e' la stessa dell'anagrafica
# in build-data.py, ricavata dai dati e confermata dalla Presidenza. Le due
# catene delicate:
#   - Smit: FCZ -> TrasCapitano -> Trans Pupone -> TransCapitano -> Noah ->
#     Specialone -> DDR -> Gaspacho
#   - La Casata dei Draghi: TARGARYEN -> La Casata dei Draghi -> Hokuto ->
#     Real Militum, poi lascia la lega e il suo posto va a Roburro dal 2020-21
# "Ska..rsi Odessa" e' l'Armata Rossa della sola 2021-22: si riconosce perche'
# in quella stagione l'Armata Rossa non compare e le squadre restano dieci.
SQUADRE = {
    "armata rossa": "armata-rossa",
    "ska..rsi odessa": "armata-rossa",
    "aston ville di corsano": "aston-ville",
    "aston ville": "aston-ville",
    "disperata": "disperata",
    "la disperata": "disperata",
    "prosecco": "prosecco",
    "pro secco": "prosecco",
    "real monghi": "real-monghi",
    "roburro": "roburro",
    "sanguemisto": "sanguemisto",
    "subbuteo": "subbuteo",
    "sporting mangiapreti": "sporting-mangiapreti",
    "sporting manigapreti": "sporting-mangiapreti",
    "smit gaspacho": "smit",
    "smit ddr": "smit",
    "smit specialone": "smit",
    "smit noah": "smit",
    "smit transcapitano": "smit",
    "smit trascapitano": "smit",
    "smit trans pupone": "smit",
    "fcz": "smit",
    "la casata dei draghi": "casata-draghi",
    "targaryen": "casata-draghi",
    "hokuto": "casata-draghi",
    "real militum": "casata-draghi",
}

# Codici bonus di Fantapazz. Non sono documentati da nessuna parte: li abbiamo
# ricavati dai dati stessi, guardando quali ruoli li ricevono e con cosa si
# accompagnano. Il 2 e il 10 compaiono solo sui portieri, l'8 e' rarissimo e
# colpisce difensori e centrocampisti, il 15 accompagna sempre un gol ed e' il
# "gol vittoria" del regolamento. Il ragionamento sta nella SPIEGAZIONE.
BONUS = {
    "1": ("gol", "Gol", 3.0),
    "2": ("gol-subito", "Gol subito", -1.0),
    "3": ("rigore", "Rigore segnato", 3.0),
    "4": ("rigore-sbagliato", "Rigore sbagliato", -3.0),
    "5": ("rigore-parato", "Rigore parato", 3.0),
    "6": ("giallo", "Ammonizione", -0.5),
    "7": ("rosso", "Espulsione", -1.0),
    "8": ("autogol", "Autogol", -2.0),
    "9": ("assist", "Assist", 1.0),
    "10": ("imbattuto", "Porta inviolata", 1.0),
    "15": ("gol-vittoria", "Gol vittoria", 1.0),
}

ORDINE = {"P": 0, "D": 1, "C": 2, "A": 3}


def squadra(nome):
    # gli spazi doppi e le maiuscole cambiano di stagione in stagione
    chiave = " ".join((nome or "").split()).lower()
    id = SQUADRE.get(chiave)
    if id is None:
        raise SystemExit(f"Societa' non riconosciuta: {nome!r}")
    return id


def giocatore(g):
    nid, gruppo, ruolo, nome, sfida, voto, bonus, fascia = g
    codici = [c for c in (bonus or "").split(",") if c]
    return {
        "id": nid,
        "ruolo": ruolo,
        "nome": nome,
        # "Mil-Cag" e' la partita di Serie A: il club del calciatore e' il primo
        # solo quando gioca in casa, quindi teniamo la sfida intera e basta.
        "sfida": sfida or None,
        "voto": voto,
        "bonus": [{"id": BONUS[c][0], "nome": BONUS[c][1]} for c in codici if c in BONUS],
        "fascia": fascia,
        "entrato": gruppo == "R" and voto is not None,
    }


def modulo(titolari):
    n = {r: sum(1 for t in titolari if t["ruolo"] == r) for r in "PDCA"}
    return f"{n['D']}-{n['C']}-{n['A']}"


def lato(l):
    tutti = [giocatore(g) for g in l["g"]]
    titolari = [g for g, raw in zip(tutti, l["g"]) if raw[1] == "T"]
    # L'ordine della panchina NON si tocca: e' quello in cui il mister ha messo
    # le riserve ed e' esattamente cio' che decide chi entra al posto di chi.
    # Riordinarlo per ruolo, come si sarebbe tentati di fare per leggerlo
    # meglio, rende impossibile ricalcolare i fantapunti.
    panchina = [g for g, raw in zip(tutti, l["g"]) if raw[1] == "R"]
    return {
        "mister": l.get("m"),
        "inviata": l.get("q"),
        "avviso": l.get("a"),
        "modulo": modulo(titolari),
        "modificatori": [{"nome": n, "valore": v} for n, v in (l.get("mod") or [])],
        "titolari": titolari,
        "panchina": panchina,
    }


# nelle coppe a eliminazione una societa' puo' passare il turno senza giocare:
# Fantapazz mette "Nessuna squadra" al posto dell'avversario
RIPOSO = {"nessuna squadra", "", "-"}


def partite_di(blocco):
    partite = []
    for p in blocco["p"]:
        nomi = [" ".join((p.get(k) or "").split()).lower() for k in ("c", "f")]
        if any(n in RIPOSO for n in nomi):
            continue
        lati = [lato(x) for x in p["l"]]
        lati[0]["team"] = squadra(p["c"])
        lati[1]["team"] = squadra(p["f"])
        partite.append({
            "casa": lati[0]["team"], "fuori": lati[1]["team"],
            "golCasa": p["gc"], "golFuori": p["gf"],
            "fpCasa": p["fc"], "fpFuori": p["ff"],
            "lati": lati,
        })
    return partite


def main():
    file = sorted(glob.glob(os.path.join(SORGENTI, "*.json")))
    if not file:
        raise SystemExit(f"Nessun file in {SORGENTI}")

    cartella = os.path.join(DATI, "lineups")
    os.makedirs(cartella, exist_ok=True)
    # I file vengono sovrascritti, non cancellati: su alcune cartelle condivise
    # la cancellazione non e' permessa e lo script si fermerebbe a meta'. Alla
    # fine segnaliamo eventuali stagioni rimaste senza sorgente.
    prima = {os.path.basename(x) for x in glob.glob(os.path.join(cartella, "*.json"))}

    indice, moduli = [], {}
    for path in file:
        with open(path, encoding="utf-8") as f:
            grezzo = json.load(f)
        stagione = grezzo["stagione"]

        campionato = [{"giornata": b["g"], "partite": partite_di(b)}
                      for b in sorted(grezzo.get("campionato", []), key=lambda x: x["g"])]
        coppe = [{"turno": c["turno"], "partite": partite_di(c)}
                 for c in grezzo.get("coppe", [])]

        # Un file per stagione: tutte insieme fanno 10 MB e il sito non deve
        # scaricarli per mostrarne una sola.
        fuori = {"stagione": stagione, "giornate": campionato, "coppe": coppe}
        out = os.path.join(cartella, f"{stagione}.json")
        with open(out, "w", encoding="utf-8") as f:
            json.dump(fuori, f, ensure_ascii=False, separators=(",", ":"),
                      allow_nan=False)

        for gruppo in (campionato, coppe):
            for t in gruppo:
                for p in t["partite"]:
                    for l in p["lati"]:
                        moduli[l["modulo"]] = moduli.get(l["modulo"], 0) + 1

        squadre = sorted({s for t in campionato for p in t["partite"]
                          for s in (p["casa"], p["fuori"])})
        indice.append({
            "stagione": stagione,
            "giornate": [t["giornata"] for t in campionato],
            "coppe": [t["turno"] for t in coppe],
            "squadre": squadre,
        })
        n = sum(len(t["partite"]) for t in campionato)
        m = sum(len(t["partite"]) for t in coppe)
        print(f"  {stagione}  {len(campionato):>2} giornate, {n:>3} partite di "
              f"campionato + {m:>3} di coppa   ({os.path.getsize(out)/1024:.0f} KB)")

    scritti = {f"{x['stagione']}.json" for x in indice}
    orfani = sorted(prima - scritti)
    if orfani:
        print("\n  ATTENZIONE, stagioni senza piu' un file sorgente "
              "(da rimuovere a mano):", ", ".join(orfani))

    path = os.path.join(DATI, "lineups-index.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"stagioni": indice}, f, ensure_ascii=False,
                  separators=(",", ":"), allow_nan=False)

    print(f"\n  -> src/data/lineups/  ({len(indice)} stagioni)")
    print(f"  -> src/data/lineups-index.json  ({os.path.getsize(path)/1024:.0f} KB)")
    print("     moduli:", ", ".join(f"{m} x{n}" for m, n in
                                    sorted(moduli.items(), key=lambda x: -x[1])[:8]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
