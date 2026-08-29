# supabase/migrations

Copia nel repo delle migrazioni che il database ha in
`supabase_migrations.schema_migrations`.

## Perche' esiste

Le modifiche allo schema e i caricamenti di dati fatti da una sessione con
`apply_migration` finiscono in quella tabella, con il corpo SQL dentro: a un
reset del database si rigiocano. Ma finche' restano li' non stanno in git, e
chi ricostruisce il progetto dal repo parte da uno schema vuoto.

Questa cartella e' la meta' che mancava. Non e' generata a mano: si riempie con

    cd <radice del repo>
    python3 scripts/esporta-migrazioni.py

Il DSN non si passa a mano: lo script legge `CAPRERA_DSN`, poi `DATABASE_URL`,
poi `~/.caprera-dsn`. Se serve psycopg: `pip3 install 'psycopg[binary]'`.

e va rilanciato **dopo ogni sessione che tocca il database**. Il controllo senza
scrittura, da mettere nel collaudo, e'

    python3 scripts/esporta-migrazioni.py --controlla

che esce con 1 se il repo e' indietro.

## Le regole

- **Non si modifica un file gia' esportato.** E' la trascrizione di una cosa
  gia' successa nel database, non un sorgente. Per correggere si scrive una
  migrazione nuova.
- **I nomi che cominciano per `lavoro_`** caricano lo schema di appoggio
  `lavoro`, non l'archivio: sono i fogli grezzi prima della lettura.
- Il DSN non entra qui dentro ne' in nessun file versionato.

## Cosa c'e' dentro adesso

Solo `..._caprera_mercato_verso_entrata_o_uscita.sql`, messa a mano per far
vedere la forma. Le altre — un centinaio, da `caprera_schema_archivio` in poi —
arrivano al primo lancio dello script.
