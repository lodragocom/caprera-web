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

Scrive supabase/migrations/<versione>_<nome>.sql, uno per migrazione, e non
tocca i file gia' presenti che sono identici. Con --controlla non scrive niente
e dice solo cosa manca: serve al collaudo.

Il DSN non viene mai stampato, ne' finito in un file. Se non lo trova, si ferma.
"""
import os, sys, pathlib

RADICE = pathlib.Path(__file__).resolve().parent.parent
DESTINAZIONE = RADICE / "supabase" / "migrations"


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

    with connessione() as conn, conn.cursor() as cur:
        cur.execute("""
            select version, coalesce(nullif(name, ''), 'senza-nome'),
                   array_to_string(statements, E'\\n\\n')
              from supabase_migrations.schema_migrations
             where statements is not null
             order by version
        """)
        righe = cur.fetchall()

    nuovi, cambiati, uguali = [], [], 0
    for versione, nome, sql in righe:
        f = DESTINAZIONE / f"{versione}_{nome}.sql"
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
