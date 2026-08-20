# Collaudo del sito

Due script che aprono il sito con un browser vero e provano a romperlo.

Servono perche' un errore JavaScript non si vede a occhio: la pagina resta
li' mezza vuota e i link semplicemente non rispondono. E' cosi' che si era
rotta la pagina Coppe — le sfide dei gironi non hanno un punteggio
complessivo, il codice lo leggeva lo stesso e l'intera pagina moriva.

## Come si usano

    npm run build
    npx vite preview --port 4180 &
    node collaudo/collaudo-sito.mjs
    node collaudo/collaudo-area.mjs

## Cosa controllano

`collaudo-sito.mjs` — le pagine pubbliche e le schede di tutte le societa':
apre ogni rotta, preme ogni bottone di stagione e di giornata, sceglie ogni
voce di ogni menu a tendina, poi segue davvero sette link (albo d'oro,
tabellone, bacheca, percorso, partite) e controlla di essere arrivato da
qualche parte. Segnala errori JS, pagine quasi vuote e link che non navigano.

`collaudo-area.mjs` — l'area del mister. Qui si naviga cliccando la barra
laterale e non ricaricando la pagina: la sessione sta in memoria e un
caricamento da zero riporterebbe al login (scelta voluta, vedi `src/lib/auth.jsx`).

Alla fine stampano "nessun problema" oppure l'elenco di cosa non va.
