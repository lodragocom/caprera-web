#!/usr/bin/env python3
"""
Converte i file sorgente della Lega Caprera (Excel/CSV) in JSON statico
consumato dal frontend React.

Input  : /mnt/user-data/uploads/06_caprera_project/
Output : src/data/*.json
"""
import glob
import io
import json
import os
import re
import unicodedata
import warnings

import pandas as pd

warnings.filterwarnings("ignore")

SRC = os.environ.get("CAPRERA_SRC", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "06_caprera_project"))
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- anagrafica
# Le societa' cambiano nome nel tempo (Smit ne cambia uno all'anno).
# Qui la mappa variante -> id canonico.
TEAMS = [
    {
        "id": "armata-rossa",
        "name": "Armata Rossa",
        "code": "ARR",
        "logo": "armata-rossa.webp",
        "color": "#8f1d1d",
        "aliases": ["armata rossa", "Armata Rossa", "Ska..rsi Odessa"],
    },
    {
        "id": "aston-ville",
        "name": "Aston Ville di Corsano",
        "code": "AVL",
        "logo": "aston-ville.webp",
        "color": "#2a1a6b",
        "aliases": ["Aston Ville di Corsano"],
    },
    {
        "id": "disperata",
        "name": "Disperata",
        "code": "DSP",
        "logo": "disperata.webp",
        "color": "#7a1010",
        "aliases": ["Disperata", "La Disperata"],
    },
    {
        "id": "prosecco",
        "name": "Prosecco",
        "code": "PRS",
        "logo": "prosecco.webp",
        "color": "#a8863f",
        "aliases": ["Prosecco", "Pro Secco", "ProSecco"],
    },
    {
        "id": "real-monghi",
        "name": "Real Monghi",
        "code": "RMO",
        "logo": "real-monghi.webp",
        "color": "#5a2020",
        "aliases": ["Real Monghi"],
    },
    {
        "id": "roburro",
        "name": "Roburro",
        "code": "ROB",
        "logo": "roburro.webp",
        "color": "#b0803a",
        "aliases": ["Roburro"],
    },
    {
        "id": "sanguemisto",
        "name": "Sanguemisto",
        "code": "SAM",
        "logo": "sanguemisto.webp",
        "color": "#6b1f33",
        "aliases": ["Sanguemisto"],
    },
    {
        "id": "smit",
        "name": "Smit Gaspacho",
        "code": "SMT",
        "logo": "smit.webp",
        "color": "#5c1030",
        "aliases": [
            "Smit Gaspacho", "Smit DDR", "Smit Specialone", "Smit Noah",
            "Smit TransCapitano", "Smit Trans Pupone", "Smit TrasCapitano", "FCZ",
        ],
    },
    {
        "id": "sporting-mangiapreti",
        "name": "Sporting Mangiapreti",
        "code": "MGP",
        "logo": "sporting-mangiapreti.webp",
        "color": "#6e0f0f",
        "aliases": ["Sporting Mangiapreti", "Sporting Manigapreti"],
    },
    {
        "id": "subbuteo",
        "name": "Subbuteo",
        "code": "SUB",
        "logo": "subbuteo.webp",
        "color": "#0f5a3c",
        "aliases": ["Subbuteo", "SUBBUTEO"],
    },
    # --- societa' storiche, non piu' in attivita' -------------------------
    # LLD occupa lo stesso slot che dal 2020-21 e' di Roburro, ma il sistema
    # della lega (dashboard Shiny, da cui viene il CSV delle rose) le tiene
    # come due entita' distinte: LLD ha un codice suo e nessun logo.
    # Quindi NON vengono unite: LLD e' una societa' a se', chiusa nel 2019-20.
    {
        "id": "casata-draghi",
        "name": "La Casata dei Draghi",
        "code": "LLD",
        "logo": None,
        "color": "#4a3f6b",
        "active": False,
        "aliases": ["La Casata dei Draghi", "TARGARYEN", "Hokuto", "Real Militum"],
    },
]

for _t in TEAMS:
    _t.setdefault("active", True)

# Nomi brevi per tabelle e card fitte, dove il nome intero andrebbe a capo.
SHORT = {
    "armata-rossa": "Armata Rossa",
    "aston-ville": "Aston Ville",
    "disperata": "Disperata",
    "prosecco": "Prosecco",
    "real-monghi": "Real Monghi",
    "roburro": "Roburro",
    "sanguemisto": "Sanguemisto",
    "smit": "Smit",
    "sporting-mangiapreti": "Mangiapreti",
    "subbuteo": "Subbuteo",
    "casata-draghi": "Casata Draghi",
}

ALIAS_TO_ID = {}
CODE_TO_ID = {}
for t in TEAMS:
    CODE_TO_ID[t["code"]] = t["id"]
    for a in t["aliases"]:
        ALIAS_TO_ID[a.strip().lower()] = t["id"]


def team_id(name):
    if not isinstance(name, str):
        return None
    return ALIAS_TO_ID.get(name.strip().lower())


# ---------------------------------------------------------------- calendario
def load_calendar():
    """calendario.xls e' in realta' un CSV incapsulato in una singola colonna."""
    raw = pd.read_excel(os.path.join(SRC, "calendario.xls"), header=None)[0].tolist()
    df = pd.read_csv(io.StringIO("\n".join(str(x) for x in raw)))
    df = df[["Stagione", "Giornata", "home", "score_home", "goal_home",
             "away", "score_away", "goal_away"]]

    rows = []
    unknown = set()
    for r in df.itertuples(index=False):
        h, a = team_id(r.home), team_id(r.away)
        if h is None:
            unknown.add(r.home)
        if a is None:
            unknown.add(r.away)
        played = pd.notna(r.goal_home) and pd.notna(r.goal_away)
        rows.append({
            "season": r.Stagione,
            "round": int(r.Giornata),
            "home": h,
            "away": a,
            "homeFp": round(float(r.score_home), 2) if pd.notna(r.score_home) else None,
            "awayFp": round(float(r.score_away), 2) if pd.notna(r.score_away) else None,
            "homeGoals": int(r.goal_home) if played else None,
            "awayGoals": int(r.goal_away) if played else None,
            "played": bool(played),
        })
    if unknown:
        print("  ATTENZIONE, squadre non mappate:", unknown)
    return rows


def build_standings(matches):
    """Classifica per stagione: 3 punti vittoria, 1 pareggio."""
    by_season = {}
    for m in matches:
        if not m["played"]:
            continue
        s = by_season.setdefault(m["season"], {})
        for side, opp in (("home", "away"), ("away", "home")):
            tid = m[side]
            if tid is None:
                continue
            row = s.setdefault(tid, {
                "team": tid, "played": 0, "won": 0, "drawn": 0, "lost": 0,
                "goalsFor": 0, "goalsAgainst": 0, "points": 0, "fantapoints": 0.0,
            })
            gf, ga = m[side + "Goals"], m[opp + "Goals"]
            fp = m[side + "Fp"]
            row["played"] += 1
            row["goalsFor"] += gf
            row["goalsAgainst"] += ga
            if fp is not None:
                row["fantapoints"] += fp
            if gf > ga:
                row["won"] += 1
                row["points"] += 3
            elif gf == ga:
                row["drawn"] += 1
                row["points"] += 1
            else:
                row["lost"] += 1

    out = {}
    for season, teams in by_season.items():
        table = list(teams.values())
        for t in table:
            t["goalDiff"] = t["goalsFor"] - t["goalsAgainst"]
            t["fantapoints"] = round(t["fantapoints"], 2)
        # Criteri regolamento: punti, differenza reti, gol fatti, fantapunti
        table.sort(key=lambda t: (-t["points"], -t["goalDiff"], -t["goalsFor"], -t["fantapoints"]))
        for i, t in enumerate(table, 1):
            t["position"] = i
        out[season] = table
    return out


# --------------------------------------------------------------------- rose
HTML_CODE = re.compile(r"<span>\s*([A-Z]{3})\s*</span>")


def full_season(s):
    """'24-25' -> '2024-25', per allinearsi al formato del calendario."""
    s = str(s).strip()
    return s if len(s) == 7 else "20" + s


def load_rosters():
    """
    Storico (export della dashboard Shiny) + eventuali CSV per stagione
    prodotti da caprera-dati/PROGRAMMI/importa-rose-asta.py, che si chiamano
    rose_AAAA-AA.csv e stanno nella stessa cartella dei sorgenti.
    """
    frames = [pd.read_csv(os.path.join(SRC, "tabella_rose_per_stagione(1).csv"))]
    extra = sorted(glob.glob(os.path.join(SRC, "rose_*.csv")))
    for path in extra:
        frames.append(pd.read_csv(path))
        print(f"  + {os.path.basename(path)}")
    df = pd.concat(frames, ignore_index=True)

    rows = []
    for r in df.itertuples(index=False):
        squadra = str(r.Squadra)
        m = HTML_CODE.search(squadra)
        # lo storico ha HTML nella cella, i CSV per stagione il codice nudo
        codice = m.group(1) if m else squadra.strip().upper()
        tid = CODE_TO_ID.get(codice)
        if tid is None:
            continue  # squadre storiche senza corrispondenza attuale (es. LLD)
        if pd.isna(r.Calciatore) or pd.isna(r.Ruolo):
            continue  # righe vuote nel CSV sorgente
        rows.append({
            "player": str(r.Calciatore).strip(),
            "team": tid,
            "role": r.Ruolo,
            "season": full_season(r.Stagione),
            "cost": int(r.Costo) if pd.notna(r.Costo) else None,
            "club": r.Club if pd.notna(r.Club) else None,
            "apps": int(r.Presenze) if pd.notna(r.Presenze) else None,
            "fm": round(float(getattr(r, "_7")), 2) if pd.notna(getattr(r, "_7")) else None,
            "mv": round(float(getattr(r, "_8")), 2) if pd.notna(getattr(r, "_8")) else None,
        })
    return rows


# --------------------------------------------------------------- contratti
def load_contracts():
    """
    contratti_storico.csv, estratto dal PDF della Presidenza.
    Fonte provvisoria: sara' sostituita dalla tabella Contratti della
    dashboard Shiny (358 righe, con clausole e salari) appena disponibile.
    """
    path = os.path.join(SRC, "contratti_storico.csv")
    if not os.path.exists(path):
        return []
    df = pd.read_csv(path)
    rows = []
    for r in df.itertuples(index=False):
        tid = CODE_TO_ID.get(str(r.codice).strip().upper())
        if tid is None:
            continue
        rows.append({
            "team": tid,
            "player": str(r.calciatore).strip(),
            "role": r.ruolo,
            "under": str(r.under).strip().lower() == "si",
            "from": r.stagione_inizio,
            "to": r.stagione_fine,
            "years": int(r.durata),
        })
    return rows


# ---------------------------------------------------------------- finanze
def load_finances():
    """finanze_AAAA-AA.csv prodotti da importa-rose-asta.py."""
    out = {}
    for path in sorted(glob.glob(os.path.join(SRC, "finanze_*.csv"))):
        season = re.search(r"(20\d\d-\d\d)", os.path.basename(path)).group(1)
        df = pd.read_csv(path)
        righe = []
        for r in df.itertuples(index=False):
            tid = CODE_TO_ID.get(str(r.codice).strip().upper())
            if tid is None:
                continue
            def num(v):
                return int(v) if pd.notna(v) else None
            righe.append({
                "team": tid,
                "initial": num(r.crediti_iniziali),
                "spent": num(r.crediti_spesi),
                "trades": num(r.saldo_scambi),
                "left": num(r.crediti_residui),
                "carried": num(r.crediti_rimasti),
                "bonus": num(r.vincite_penalty),
                "ffp": num(r.premio_ffp),
            })
        righe.sort(key=lambda x: -(x["spent"] or 0))
        out[season] = righe
        print(f"  + {os.path.basename(path)}")
    return out


# ------------------------------------------------------------------ listone
def load_listone():
    df = pd.read_csv(os.path.join(SRC, "Listone_Fantapazz.csv"), sep=";", encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]
    return [
        {
            "role": r.Ruolo,
            "player": str(r.Calciatore).strip(),
            "club": None if pd.isna(r.Squadra) else str(r.Squadra).strip(),
            "price": int(r.Quotazione) if pd.notna(r.Quotazione) else None,
        }
        for r in df.itertuples(index=False)
        if pd.notna(r.Calciatore)
    ]


# --------------------------------------------------------------------- main
def main():
    print("Calendario e risultati...")
    matches = load_calendar()
    standings = build_standings(matches)
    seasons = sorted({m["season"] for m in matches})
    print(f"  {len(matches)} partite, {len(seasons)} stagioni ({seasons[0]} - {seasons[-1]})")

    print("Rose storiche...")
    rosters = load_rosters()
    print(f"  {len(rosters)} righe rosa")

    print("Contratti...")
    contracts = load_contracts()
    print(f"  {len(contracts)} contratti")

    print("Finanze...")
    finances = load_finances()

    print("Listone Fantapazz...")
    listone = load_listone()
    print(f"  {len(listone)} calciatori quotati")

    # albo d'oro derivato dalle classifiche
    palmares = {}
    for season, table in standings.items():
        palmares.setdefault(table[0]["team"], []).append(season)

    teams_out = []
    for t in TEAMS:
        titles = sorted(palmares.get(t["id"], []))
        played = [s for s in seasons if any(
            m["season"] == s and t["id"] in (m["home"], m["away"]) for m in matches)]
        teams_out.append({
            "id": t["id"], "name": t["name"], "short": SHORT[t["id"]], "code": t["code"],
            "logo": t["logo"], "color": t["color"], "active": t["active"],
            "formerNames": [a for a in t["aliases"] if a.lower() != t["name"].lower()],
            "titles": titles,
            "seasons": played,
        })

    # Riepilogo leggero per la homepage, cosi' non deve importare
    # matches.json / rosters.json (che pesano ~500 KB in totale).
    last_played = next(
        (s for s in reversed(seasons) if standings.get(s)), seasons[-1]
    )
    upcoming = [m for m in matches if m["season"] == seasons[-1] and not m["played"]]
    next_round = min((m["round"] for m in upcoming), default=None)

    summary = {
        "currentSeason": seasons[-1],
        "lastPlayedSeason": last_played,
        "totals": {
            "seasons": len(seasons),
            "matches": sum(1 for m in matches if m["played"]),
            "goals": sum((m["homeGoals"] or 0) + (m["awayGoals"] or 0) for m in matches),
            "players": len({r["player"] for r in rosters}),
        },
        "palmares": [
            {"season": s, "team": standings[s][0]["team"], "points": standings[s][0]["points"]}
            for s in reversed(seasons) if standings.get(s)
        ],
        "nextRound": {
            "round": next_round,
            "fixtures": [
                {"home": m["home"], "away": m["away"]}
                for m in upcoming if m["round"] == next_round
            ],
        } if next_round else None,
    }

    files = {
        "summary.json": summary,
        "teams.json": teams_out,
        "matches.json": matches,
        "standings.json": standings,
        "rosters.json": rosters,
        "listone.json": listone,
        "contracts.json": contracts,
        "finances.json": finances,
        "seasons.json": seasons,
    }
    for name, payload in files.items():
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as f:
            # allow_nan=False: NaN/Infinity non sono JSON valido e romperebbero
            # il bundler. Meglio fallire qui che a build time.
            json.dump(payload, f, ensure_ascii=False, separators=(",", ":"),
                      allow_nan=False)
        print(f"  -> src/data/{name}  ({os.path.getsize(path)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
