#!/usr/bin/env python3
"""Porta nel repo le migrazioni che vivono solo dentro Supabase.

Perche' esiste
--------------
Ogni modifica allo schema e ogni caricamento fatto con apply_migration finisce
in supabase_migrations.schema_migrations, con il corpo SQL dentro. Sopravvive a
un reset del database, ma NON sta in git: chi ricostruisce il progetto dal repo
non ce l'ha. Questo script colma la distanza, e va rilanciato dopo ogni sessione
che tocca il database.

Come si usa
-----------
    cd <radice del repo>
    python3 scripts/esporta-migrazioni.py

Il DSN se lo cerca da solo: prima CAPRERA_DSN nell'ambiente, poi DATABASE_URL,
poi il file ~/.caprera-dsn. Nel caso normale non c'e' niente da esportare a mano.

Due destinazioni, e non e' un dettaglio
--------------------------------------
Le migrazioni che caricano CONTRATTI, FINANZE o MOVIMENTI non finiscono qui:
vanno in ../caprera-dati/SUPABASE/migrazioni-dati/. Questo repo e' pubblico,
quello dei dati no, e CAPRERA.md dice che contratti, finanze e mister non hanno
finestra. Un file .sql nel repo darebbe quei numeri a chiunque senza passare dal
sito e dalle regole di riga — cioe' scavalcando l'unica cosa che decide chi vede
cosa. Rose, listoni, calciatori e statistiche restano qui: sul sito sono
pubblici comunque.

La regola e' automatica (vedi RISERVATE): chi aggiunge una migrazione non deve
ricordarsi niente, e chi la sposta a mano se la ritrova rimessa al posto giusto
al prossimo giro.

Scrive <destinazione>/<versione>_<nome>.sql, uno per migrazione, e non tocca i
file gia' presenti che sono identici. Con --controlla non scrive niente e dice
solo cosa manca: serve al collaudo.

Il DSN non viene mai stampato, ne' finito in un file. Se non lo trova, si ferma.
"""
import os, re, sys, pathlib

RADICE = pathlib.Path(__file__).resolve().parent.parent
DESTINAZIONE = RADICE / "supabase" / "migrations"
DESTINAZIONE_DATI = RADICE.parent / "caprera-dati" / "SUPABASE" / "migrazioni-dati"

# Una migrazione e' riservata se scrive in una delle tre tabelle che il progetto
# tiene senza finestra pubblica. Il DDL che le CREA non lo e': la forma di una
# tabella non e' il suo contenuto.
RISERVATE = re.compile(r"\b(?:insert\s+into|update)\s+caprera\.(finanze|contratti|movimenti)\b")


def dove_va(sql: str) -> pathlib.Path:
    return DESTINAZIONE_DATI if RISERVATE.search(sql.lower()) else DESTINAZIONE


def dsn() -> str:
    v = os.environ.get("CAPRERA_DSN") or os.environ.get("DATABASE_URL")
    if v:
        return v.strip()
    f = pathlib.Path.home() / ".caprera-dsn"
    if f.exists():
        return f.read_text().strip()
    sys.exit(
        "Manca il DSN. Lo cerco in CAPRERA_DSN, poi in DATABASE_URL, poi in\n"
        "~/.caprera-dsn. Se il file c'e' ma non lo leggo, controlla i permessi:\n"
        "    chmod 600 ~/.caprera-dsn\n"
        "Il DSN non va incollato a terminale: basta che stia nel file."
    )


def connessione():
    try:
        import psycopg
        return psycopg.connect(dsn())
    except ModuleNotFoundError:
        pass
    try:
        import psycopg2
        return psycopg2.connect(dsn())
    except ModuleNotFoundError:
        sys.exit("Serve psycopg (pip install psycopg[binary]) oppure psycopg2.")


def main() -> int:
    controlla = "--controlla" in sys.argv
    DESTINAZIONE.mkdir(parents=True, exist_ok=True)
    if DESTINAZIONE_DATI.parent.parent.exists():
        DESTINAZIONE_DATI.mkdir(parents=True, exist_ok=True)

    with connessione() as conn, conn.cursor() as cur:
        cur.execute("""
            select version, coalesce(nullif(name, ''), 'senza-nome'),
                   array_to_string(statements, E'\\n\\n')
              from supabase_migrations.schema_migrations
             where statements is not null
             order by version
        """)
        righe = cur.fetchall()

    nuovi, cambiati, uguali, riservate = [], [], 0, 0
    for versione, nome, sql in righe:
        cartella = dove_va(sql or "")
        if cartella is DESTINAZIONE_DATI:
            riservate += 1
            if not cartella.parent.parent.exists():
                continue  # caprera-dati non e' accanto: si salta, non si ripiega qui
        f = cartella / f"{versione}_{nome}.sql"
        # una migrazione che ha cambiato natura non deve restare di la'
        gemella = (DESTINAZIONE if cartella is DESTINAZIONE_DATI else DESTINAZIONE_DATI) / f.name
        if gemella.exists() and not controlla:
            gemella.unlink()
        testo = (sql or "").rstrip() + "\n"
        if not f.exists():
            nuovi.append(f)
        elif f.read_text() != testo:
            cambiati.append(f)
        else:
            uguali += 1
            continue
        if not controlla:
            f.write_text(testo)

    print(f"{len(righe)} migrazioni nel database")
    print(f"  {riservate} riservate -> {DESTINAZIONE_DATI}")
    print(f"  {uguali} gia' identiche nel repo")
    print(f"  {len(nuovi)} {'da scrivere' if controlla else 'scritte'}")
    for f in nuovi:
        print(f"      + {f.name}")
    if cambiati:
        print(f"  {len(cambiati)} DIVERSE dal repo {'(non toccate)' if controlla else '(riscritte)'}")
        for f in cambiati:
            print(f"      ! {f.name}")

    if controlla and (nuovi or cambiati):
        print("\nIl repo non e' allineato al database. Rilancia senza --controlla.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
