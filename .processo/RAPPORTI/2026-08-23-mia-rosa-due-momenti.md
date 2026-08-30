# 2026-08-23 · «La mia rosa» adesso mostra le due rose

> Con la rosa di partenza in archivio, la pagina del mister può dire una cosa che prima non
> poteva: **cosa hai comprato all'asta, e cosa ti sei ritrovato a maggio.**

---

## Perché la rosa di maggio da sola non bastava

La rosa di fine anno contiene chi è arrivato a gennaio e **non contiene chi è uscito**. Quindi da
sola non racconta il mercato — e, peggio, non dice nemmeno di non raccontarlo. Uno che guardava la
pagina vedeva 31 nomi e non aveva modo di sapere che cinque erano cambiati.

## Cosa si vede adesso, sul 2025-26

- **Una scheda «Il mercato di gennaio»** con i nomi: chi è uscito, chi è entrato, col costo.
  Prosecco: fuori Kouassi, Fofana, Collocolo, Dovbyk, Nzola — dentro Circati, Kostic, Zalewski,
  Fullkrug, Vaz.
- **La riga si tinge in tabella**: rossa per chi è uscito, verde per chi è entrato. Si legge
  scorrendo, prima del nome, perché «è ancora in rosa?» è la domanda che uno si fa scorrendo.
- **Una colonna «Mercato»** con la pastiglia, per chi vuole il dettaglio.
- **Un numeretto in testa**: *Cambiati a gennaio 5 — 5 fuori, 5 dentro.*

Sulle nove stagioni che hanno solo la rosa di fine anno **non cambia niente**: niente scheda,
niente colonna, niente tinte. La pagina non finge di sapere una cosa che non sa.

## Due conti che ho corretto, e non erano cosmetici

**a) I reparti contavano l'unione.** Con le due rose il gruppo degli attaccanti del Prosecco
conteneva anche Dovbyk e Nzola, usciti a gennaio: la testata diceva *«9 · 96 crediti»*, un reparto
che nella rosa non è mai esistito. Adesso conta la rosa d'asta: **6-9-9-7**, e i crediti dei quattro
reparti sommano a 265, che è esattamente «crediti spesi all'asta».

**b) La crescita si calcolava sulla rosa sbagliata.** La scheda «quanto valevano a fine stagione»
confrontava i due listoni sulla rosa di **maggio**. Ma la crescita di uno arrivato a gennaio non
l'hai vista tu, e quella di uno che hai svincolato l'hai vista per mezza stagione. Adesso il conto
è sulla rosa che hai **comprato**:

| | prima | adesso |
|---|---|---|
| Prosecco 2025-26 | 284 → 359 (+75), rosa di maggio | **325 → 373 (+48)**, rosa d'asta |

Il numero è più basso e più vero: comprende Dovbyk che è sceso da 27 a 11 mentre era suo.

## Un difetto che il banco di prova ha fatto uscire

Avevo caricato nel Postgres locale le righe di partenza **senza l'id del calciatore**. Il codice
agganciava le due rose per id, l'id era nullo, e la pagina ha risposto **«31 usciti e 31 entrati»**.

Un risultato assurdo — ma che *sembra un dato*, e in una pagina piena di numeri non si nota.
Ho corretto due cose:

1. il banco di prova, che adesso è una copia fedele della produzione, id compresi;
2. **il codice**, che adesso aggancia per id e ripiega sul nome dove l'id manca. In produzione gli
   id ci sono tutti, ma un dato che non c'è non deve produrre un numero: deve produrre niente.

## Il collaudo

Controllo nuovo in `collaudo-area.mjs`, e verifica l'invariante che regge tutto:

```
mercato di gennaio · 31 a settembre, 31 a maggio · 5 fuori, 5 dentro
```

Controlla tre cose insieme: che usciti e entrati siano lo stesso numero, che le righe tinte in
tabella siano tante quante i nomi nella scheda, e che la frase in pagina dica gli stessi numeri
delle due rose. Se una delle tre scivola, si ferma.

## File toccati

- `src/pages/area/sezioni.jsx` — la lettura della rosa di partenza, l'unione dei due momenti,
  la scheda del mercato, la colonna, i reparti, la crescita sulla rosa d'asta
- `src/pages/area/sezioni.css` — le tinte delle righe e le pastiglie
- `collaudo/collaudo-area.mjs` — il controllo

## Il prossimo

Il 2024-25. Serve il file mercato di quella stagione — l'equivalente di
`Rose_Caprera_2025-26.xlsx`, col foglio della rosa d'asta e quello degli svincoli. Il listone di
partenza 2024-25 ce l'abbiamo già.
