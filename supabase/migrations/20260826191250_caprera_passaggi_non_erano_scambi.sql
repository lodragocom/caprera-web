-- Correzione della Presidenza: scambi sono solo quelli con un accordo fra due mister.
-- Il resto del mercato non e' squadra-contro-squadra, e' acquisto dagli svincolati -
-- si compra dal mucchio di chi e' stato liberato, non da un'altra societa'.
-- Quindi sei righe che avevo scritto come scambio non sono uscite di nessuno e da
-- questa tabella devono sparire: un acquisto non e' un passaggio in uscita.
delete from caprera.passaggi
 where tipo='scambio' and certezza='foglio'
   and nome in ('Immobile','Zapata','Kean','Zalewski','Muriel','Raspadori');

-- Restano due categorie, e sono cose diverse.
-- Lo scambio vero: due societa' si accordano, c'e' un contratto depositato.
-- La clausola: il contratto scade o viene pagata la rescissoria, il giocatore passa
-- all'altra societa' e chi lo perde incassa - e' la Plusvalenza del regolamento,
-- quella che vale per il Premio Paratici.
alter table caprera.passaggi drop constraint passaggi_tipo_check;
alter table caprera.passaggi add constraint passaggi_tipo_check
  check (tipo in ('svincolo','scambio','clausola','uscita'));

update caprera.passaggi set tipo='clausola'
 where tipo='scambio' and nome in ('Martinez L.','Pinamonti');
