-- L'Armata Rossa nel 2022-23 aveva tutti e due i portieri del Torino:
-- Milinkovic-Savic, che gioco' tutte e trentotto, e Berisha, che non gioco' mai.
-- Proprio per questo l'aggancio automatico falliva: senza una riga sul foglio
-- della Serie A non c'era il ponte da attraversare.
--
-- Che sia Etrit lo dice l'anagrafe da sola: di Berisha ce ne sono due e l'altro
-- e' un centrocampista. Il club in rosa (TOR) e' il suo, e nelle altre sei
-- stagioni le presenze in rosa e sul foglio combaciano una per una —
-- 26, 31, 18, 26, 10, 14.
update caprera.rose set calciatore = 85, nome = 'Berisha E.'
 where stagione = '2022-23' and societa = 'armata-rossa' and nome = 'Berisha' and calciatore is null;
