-- Listone di partenza 2016-17: l'ultimo dei dieci. Da qui ogni stagione dell'archivio
-- ha il listone di settembre, quello che i mister avevano davanti mentre rilanciavano.
-- Massimo 40, in fila con gli altri: la scala la controllo dopo il caricamento, con
-- la stessa regola delle altre volte.
insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2016-17', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Aldegani|P|Pescara|1
Alisson|P|Roma|2
Angelo Da Costa|P|Bologna|1
Aresti|P|Pescara|1
Audero|P|Juventus|1
Bassi|P|Atalanta|1
Berisha|P|Lazio|1
Berni|P|Inter|1
Bizzarri|P|Pescara|8
Bressan|P|Chievo Verona|1
Buffon|P|Juventus|17
Carrizo|P|Inter|1
Colombo|P|Cagliari|1
Confente|P|Chievo Verona|1
Consigli|P|Sassuolo|13
Cordaz|P|Crotone|8
Diego Lopez|P|Milan|1
Donnarumma|P|Milan|13
Dragowski|P|Fiorentina|1
Festa|P|Crotone|1
Fiorillo|P|Pescara|2
Fulignati|P|Palermo|1
Gabriel|P|Milan|1
Gomis|P|Torino|2
Handanovic|P|Inter|15
Ichazo|P|Torino|1
Karnezis|P|Udinese|10
Lamanna|P|Genoa|1
Lezzerini|P|Fiorentina|1
Lobont|P|Roma|1
Marchetti|P|Lazio|11
Marson|P|Palermo|1
Mirante|P|Bologna|11
Neto|P|Juventus|1
Padelli|P|Torino|10
Pegolo|P|Sassuolo|1
Pelagotti|P|Empoli|1
Pepe Reina|P|Napoli|14
Perin|P|Genoa|12
Perisan|P|Udinese|1
Pomini|P|Sassuolo|1
Posavec|P|Palermo|9
Puggioni|P|Sampdoria|1
Pugliesi|P|Empoli|1
Radu I.|P|Inter|1
Rafael|P|Napoli|1
Rafael|P|Cagliari|2
Sarr|P|Bologna|1
Scuffet|P|Udinese|1
Seculin|P|Chievo Verona|1
Sepe|P|Napoli|1
Skorupski|P|Empoli|9
Sorrentino|P|Chievo Verona|10
Sportiello|P|Atalanta|12
Storari|P|Cagliari|9
Szczesny|P|Roma|14
Tatarusanu|P|Fiorentina|12
Tozzo|P|Sampdoria|1
Vargic|P|Lazio|1
Viviano|P|Sampdoria|11
Zima|P|Genoa|1
Abate|D|Milan|10
Acerbi|D|Sassuolo|14
Adjapong|D|Sassuolo|1
Albiol|D|Napoli|10
Aleesami|D|Palermo|6
Alex Sandro|D|Juventus|16
Ali Adnan|D|Udinese|5
Aljaz Struna|D|Palermo|4
Andjelkovic|D|Palermo|5
Andreolli|D|Inter|3
Angella|D|Udinese|4
Ansaldi|D|Inter|12
Antei|D|Sassuolo|3
Antonelli|D|Milan|11
Ariaudo|D|Sassuolo|4
Arlind Ajeti|D|Torino|5
Armero|D|Udinese|4
Astori|D|Fiorentina|9
Barba|D|Empoli|4
Barreca|D|Torino|2
Barzagli|D|Juventus|13
Basta|D|Lazio|8
Bellusci|D|Empoli|5
Benatia|D|Juventus|10
Biraghi|D|Pescara|5
Bittante|D|Empoli|3
Boldor|D|Bologna|2
Bonucci|D|Juventus|15
Bovo|D|Torino|5
Brivio|D|Atalanta|4
Bruno Alves|D|Cagliari|7
Bruno Peres|D|Roma|15
Burdisso|D|Genoa|6
Cacciatore|D|Chievo Verona|7
Calabria|D|Milan|2
Caldara|D|Atalanta|4
Campagnaro|D|Pescara|6
Cannavaro|D|Sassuolo|8
Capuano|D|Cagliari|4
Ceccarelli|D|Bologna|2
Ceccherini|D|Crotone|4
Ceppitelli|D|Cagliari|4
Cesar|D|Chievo Verona|6
Cherubin|D|Bologna|3
Chiellini|D|Juventus|12
Chiriches|D|Napoli|5
Cionek|D|Palermo|4
Cissokho|D|Genoa|4
Claiton|D|Crotone|5
Coda|D|Pescara|3
Conti|D|Atalanta|5
Cosic|D|Empoli|2
Costa A.|D|Empoli|6
Costa F.|D|Chievo Verona|2
Crescenzi|D|Pescara|4
Dainelli|D|Chievo Verona|5
D'Ambrosio|D|Inter|6
Dani Alves|D|Juventus|17
Danilo|D|Udinese|7
Danilo Avelar|D|Torino|6
De Sciglio|D|Milan|6
De Silvestri|D|Torino|10
de Vrij|D|Lazio|10
Dell'Orco|D|Sassuolo|2
Diks|D|Fiorentina|4
Dimarco|D|Empoli|4
Djimsiti|D|Atalanta|3
Dodô|D|Sampdoria|4
Drame|D|Atalanta|5
Edenilson|D|Udinese|5
Ely|D|Milan|2
Emerson|D|Roma|3
Erkin|D|Inter|9
Evra|D|Juventus|10
Faraoni|D|Udinese|3
Fazio|D|Roma|7
Felipe|D|Udinese|6
Ferrari G.|D|Crotone|4
Ferrari A.|D|Bologna|4
Fiamozzi|D|Genoa|4
Florenzi|D|Roma|17
Fontanesi|D|Sassuolo|2
Fornasier|D|Pescara|4
Frey|D|Chievo Verona|5
Gamberini|D|Chievo Verona|5
Gastaldello|D|Bologna|8
Gazzola|D|Sassuolo|4
Gentiletti|D|Genoa|6
Germoni|D|Lazio|1
Ghoulam|D|Napoli|9
Gobbi|D|Chievo Verona|5
Goldaniga|D|Palermo|5
Gomez G.|D|Milan|6
Gonzalez|D|Palermo|7
Gyomber|D|Pescara|3
Heurtaux|D|Udinese|5
Hoedt|D|Lazio|5
Hysaj|D|Napoli|8
Isla|D|Cagliari|9
Izzo|D|Genoa|8
Joao Miranda|D|Inter|14
Juan Jesus|D|Roma|6
Koulibaly|D|Napoli|12
Krafth|D|Bologna|3
Krajnc|D|Cagliari|3
Laurini|D|Empoli|5
Lazaar|D|Palermo|6
Leandro Castan|D|Torino|6
Letschert|D|Sassuolo|5
Lichtsteiner|D|Juventus|8
Lukaku|D|Lazio|6
Luperto|D|Napoli|1
Maggio|D|Napoli|3
Maietta|D|Bologna|5
Maksimovic|D|Torino|6
Maloku|D|Pescara|1
Manolas|D|Roma|14
Marchese|D|Genoa|6
Marcos Alonso|D|Fiorentina|14
Mario Rui|D|Roma|9
Martella|D|Crotone|7
Masiello|D|Atalanta|6
Masina|D|Bologna|7
Mauricio|D|Lazio|4
M'baye|D|Bologna|4
Miangue|D|Inter|1
Milic|D|Fiorentina|4
Molinaro|D|Torino|4
Moretti|D|Torino|7
Morganella|D|Palermo|5
Morleo|D|Bologna|3
Munoz|D|Genoa|5
Murillo|D|Inter|11
Murru|D|Cagliari|4
Nagatomo|D|Inter|5
Oikonomou|D|Bologna|5
Paletta|D|Milan|5
Pasqual|D|Empoli|9
Patric|D|Lazio|3
Pavlovic|D|Sampdoria|6
Pedro Pereira|D|Sampdoria|3
Peluso|D|Sassuolo|6
Pezzella|D|Palermo|2
Pisacane|D|Cagliari|3
Pol Lirola|D|Sassuolo|3
Prce|D|Lazio|1
Radu S.|D|Lazio|6
Rafael Toloi|D|Atalanta|6
Raimondi|D|Atalanta|3
Rajkovic|D|Palermo|5
Ranocchia|D|Inter|6
Regini|D|Sampdoria|4
Renzetti|D|Genoa|5
Rispoli|D|Palermo|5
Rodriguez|D|Fiorentina|15
Romagnoli|D|Milan|9
Rosi|D|Genoa|3
Rossettini|D|Torino|6
Rudiger|D|Roma|10
Rugani|D|Juventus|7
Salamon|D|Cagliari|5
Samir|D|Udinese|3
Sampirisi|D|Crotone|3
Santon|D|Inter|3
Sardo|D|Chievo Verona|3
Seck|D|Roma|1
Silvestre|D|Sampdoria|5
Skriniar|D|Sampdoria|3
Spolli|D|Chievo Verona|4
Stendardo|D|Atalanta|5
Strinic|D|Napoli|4
Suagher|D|Atalanta|4
Terranova|D|Sassuolo|3
Tomovic|D|Fiorentina|6
Tonelli|D|Napoli|8
Torosidis|D|Roma|4
Vangioni|D|Milan|5
Vergara|D|Milan|2
Vermaelen|D|Roma|9
Veseli|D|Empoli|5
Vitiello|D|Palermo|3
Vitturini|D|Pescara|2
Wague|D|Udinese|4
Wallace|D|Lazio|7
Widmer|D|Udinese|9
Yao|D|Inter|4
Zambelli|D|Empoli|3
Zampano G.|D|Crotone|5
Zampano F.|D|Pescara|5
Zapata C.|D|Milan|6
Zappacosta|D|Torino|6
Zukanovic|D|Atalanta|8
Župaric|D|Pescara|3
Acquah|C|Torino|8
Agyemang-Badu|C|Udinese|11
Ahmed Benali|C|Pescara|8
Allan|C|Napoli|15
Alvarez|C|Sampdoria|10
Aramu|C|Torino|5
Asamoah|C|Juventus|7
Badelj|C|Fiorentina|8
Balic|C|Udinese|2
Banega|C|Inter|16
Barberis|C|Crotone|5
Barella|C|Cagliari|2
Barreto|C|Sampdoria|6
Baselli|C|Torino|12
Benassi|C|Torino|10
Bernardeschi|C|Fiorentina|14
Bertolacci|C|Milan|8
Biglia|C|Lazio|15
Biondini|C|Sassuolo|4
Birsa|C|Chievo Verona|13
Bobb|C|Chievo Verona|1
Bonaventura|C|Milan|17
Borja Valero|C|Fiorentina|17
Brienza|C|Bologna|8
Brozovic|C|Inter|15
Brugman|C|Pescara|5
Bruno|C|Pescara|2
Bruno Fernandes|C|Sampdoria|12
Buchel|C|Empoli|9
Cabezas|C|Atalanta|8
Candreva|C|Inter|20
Capezzi|C|Crotone|6
Carlos Embalo|C|Palermo|9
Carmona|C|Atalanta|5
Castro|C|Chievo Verona|11
Cataldi|C|Lazio|6
Chochev|C|Palermo|5
Cigarini|C|Sampdoria|10
Cofie|C|Genoa|4
Crisetig|C|Bologna|3
Cristante|C|Pescara|4
Cristian Tello|C|Fiorentina|13
Croce|C|Empoli|8
D'Alessandro|C|Atalanta|9
Damian|C|Chievo Verona|1
David Lopez|C|Napoli|6
de Guzman|C|Napoli|4
de Paul|C|Udinese|6
De Rossi|C|Roma|10
Deiola|C|Cagliari|4
Depaoli|C|Chievo Verona|1
Dessena|C|Cagliari|4
Di Francesco|C|Bologna|8
Di Gennaro|C|Cagliari|7
Di Livio|C|Roma|1
Diawara|C|Bologna|8
Donsah|C|Bologna|10
Duncan|C|Sassuolo|11
Dzemaili|C|Bologna|11
El Hadji|C|Empoli|5
El Kaddouri|C|Napoli|7
Eramo|C|Sampdoria|4
Fazzi|C|Crotone|2
Felipe Anderson|C|Lazio|18
Felipe Melo|C|Inter|8
Fernandez|C|Fiorentina|8
Fofana|C|Udinese|5
Freuler|C|Atalanta|4
Gagliardini|C|Atalanta|3
Gakpe|C|Genoa|7
Gazzi|C|Palermo|4
Giaccherini|C|Napoli|13
Gilberto Junior|C|Fiorentina|4
Gnahore|C|Crotone|2
Gnoukouri|C|Inter|3
Gomez A.|C|Atalanta|19
Grassi|C|Napoli|5
Hallfredsson|C|Udinese|6
Hamsik|C|Napoli|19
Hernanes|C|Juventus|8
Hetemaj|C|Chievo Verona|7
Hiljemark|C|Palermo|9
Honda|C|Milan|9
Iago Falque|C|Torino|13
Ikonomidis|C|Lazio|2
Ionita|C|Cagliari|12
Ivan|C|Sampdoria|5
Izco|C|Chievo Verona|4
Jajalo|C|Palermo|4
Jallow|C|Chievo Verona|1
Jankto|C|Udinese|6
Joao Pedro|C|Cagliari|13
Jorginho|C|Napoli|12
Kessie|C|Atalanta|6
Khedira|C|Juventus|14
Kondogbia|C|Inter|11
Kone|C|Udinese|5
Krejci|C|Bologna|12
Krunic|C|Empoli|5
Kucka|C|Milan|10
Kurtic|C|Atalanta|8
Laribi|C|Sassuolo|3
Laxalt|C|Genoa|11
Lazovic|C|Genoa|6
Leitner|C|Lazio|5
Lemina|C|Juventus|6
Linetty|C|Sampdoria|7
Ljajic|C|Torino|15
Locatelli|C|Milan|2
Lodi|C|Udinese|7
Lucas Evangelista|C|Udinese|2
Lukic|C|Torino|4
Lulic|C|Lazio|10
Magnanelli|C|Sassuolo|9
Maiello|C|Empoli|3
Marchisio|C|Juventus|13
Marrone|C|Juventus|4
Matheus Pereira|C|Empoli|2
Mauri|C|Milan|3
Mazzarani|C|Crotone|6
Mazzitelli|C|Sassuolo|5
Medel|C|Inter|9
Memushaj|C|Pescara|10
Mertens|C|Napoli|15
Migliaccio|C|Atalanta|3
Miguel Veloso|C|Genoa|8
Milinkovic-Savic|C|Lazio|8
Minala|C|Lazio|3
Missiroli|C|Sassuolo|12
Mitrita|C|Pescara|4
Montolivo|C|Milan|9
Morrison|C|Lazio|3
Mounier|C|Bologna|11
Munari|C|Cagliari|3
Murgia|C|Lazio|1
Nagy|C|Bologna|7
Nainggolan|C|Roma|18
Ntcham|C|Genoa|5
Obi|C|Torino|4
Padoin|C|Cagliari|6
Pajac|C|Cagliari|3
Palombo|C|Sampdoria|4
Paredes|C|Roma|8
Parolo|C|Lazio|14
Pellegrini|C|Sassuolo|8
Perisic|C|Inter|19
Perotti|C|Roma|17
Pjanic|C|Juventus|21
Poli|C|Milan|5
Politano|C|Sassuolo|11
Pulgar|C|Bologna|3
Quaison|C|Palermo|8
Radovanovic|C|Chievo Verona|6
Rigoni N.|C|Chievo Verona|9
Rigoni L.|C|Genoa|12
Rincon|C|Genoa|13
Rizzo|C|Bologna|7
Rohden|C|Crotone|7
Sala|C|Sampdoria|6
Salifu|C|Fiorentina|2
Salzano|C|Crotone|3
Samuel Gustafson|C|Torino|7
Sanchez|C|Fiorentina|7
Saponara|C|Empoli|18
Sbrissa|C|Sassuolo|2
Selasi|C|Pescara|2
Sensi|C|Sassuolo|6
Signorelli|C|Empoli|3
Sosa|C|Milan|11
Spinazzola|C|Atalanta|4
Stoian|C|Crotone|8
Strootman|C|Roma|11
Sturaro|C|Juventus|7
Suso|C|Milan|14
Tabacchi|C|Bologna|1
Tachtsidis|C|Torino|9
Taider|C|Bologna|6
Tello|C|Empoli|4
Toledo|C|Fiorentina|6
Tonev|C|Crotone|6
Torreira|C|Sampdoria|6
Toscano|C|Palermo|1
Vainqueur|C|Roma|5
Valdifiori|C|Napoli|5
Vecino|C|Fiorentina|12
Verdi|C|Bologna|9
Verre|C|Pescara|6
Vives|C|Torino|6
Zanimacchia|C|Genoa|1
Zielinski|C|Napoli|13
Zonta|C|Inter|1
Acquafresca|A|Bologna|4
Babacar|A|Fiorentina|13
Bacca|A|Milan|28
Baez|A|Fiorentina|3
Balogh|A|Palermo|7
Belotti|A|Torino|21
Bentivegna|A|Palermo|2
Berardi|A|Sassuolo|22
Biabiany|A|Inter|8
Borriello|A|Cagliari|13
Boye|A|Torino|4
Budimir|A|Sampdoria|15
Caprari|A|Pescara|14
Cassano|A|Sampdoria|12
De Giorgio|A|Crotone|3
Defrel|A|Sassuolo|17
Destro|A|Bologna|19
Di Roberto|A|Crotone|6
Diego Farias|A|Cagliari|14
Djordjevic|A|Lazio|14
Djuricic|A|Sampdoria|8
Dumitru|A|Napoli|4
Dybala|A|Juventus|34
Dzeko|A|Roma|20
El Shaarawy|A|Roma|21
Ewandro|A|Udinese|4
Falcinelli|A|Sassuolo|8
Floccari|A|Bologna|11
Floro Flores|A|Chievo Verona|12
Gabbiadini|A|Napoli|16
Gerson|A|Roma|10
Giannetti|A|Cagliari|10
Gilardino|A|Empoli|17
Hagi|A|Fiorentina|3
Harbaoui|A|Udinese|9
Higuain|A|Juventus|40
Icardi|A|Inter|31
Ilicic|A|Fiorentina|23
Immobile|A|Lazio|20
Inglese|A|Chievo Verona|11
Insigne R.|A|Napoli|5
Insigne L.|A|Napoli|23
Iturbe|A|Roma|9
Jose Callejon|A|Napoli|19
Jovetic|A|Inter|16
Kalinic|A|Fiorentina|23
Keita|A|Lazio|16
Kishna|A|Lazio|7
Lapadula|A|Milan|17
Lombardi|A|Lazio|1
Lopez|A|Torino|11
Luiz Adriano|A|Milan|14
Maccarone|A|Empoli|18
Manaj|A|Pescara|9
Mandzukic|A|Juventus|26
Marilungo|A|Atalanta|7
Martinez|A|Torino|10
Martins|A|Inter|17
Matri|A|Sassuolo|10
Mchedlidze|A|Empoli|7
Meggiorini|A|Chievo Verona|14
Melchiorri|A|Cagliari|13
Milik|A|Napoli|24
Mohamed Salah|A|Roma|24
M'Poku|A|Chievo Verona|6
Muriel|A|Sampdoria|14
Nalini|A|Crotone|4
Nestorovski|A|Palermo|12
Niang|A|Milan|18
Nicastro|A|Pescara|3
Nwankwo|A|Crotone|10
Ocampos|A|Genoa|12
Palacio|A|Inter|12
Palladino|A|Crotone|11
Paloschi|A|Atalanta|20
Pandev|A|Genoa|9
Parigini|A|Chievo Verona|4
Pavoletti|A|Genoa|24
Pellissier|A|Chievo Verona|10
Penaranda|A|Udinese|12
Perea|A|Lazio|4
Perica|A|Udinese|6
Petagna|A|Atalanta|8
Pierini|A|Sassuolo|1
Pinamonti|A|Inter|1
Pinilla|A|Atalanta|12
Pjaca|A|Juventus|15
Pucciarelli|A|Empoli|12
Quagliarella|A|Sampdoria|17
Ricci|A|Roma|7
Rossi|A|Fiorentina|16
Ryder Matos|A|Udinese|8
Sau|A|Cagliari|15
Schick|A|Sampdoria|10
Simeone|A|Genoa|12
Tchanturia|A|Empoli|1
Thereau|A|Udinese|19
Totti|A|Roma|13
Tounkara|A|Lazio|5
Trajkovski|A|Palermo|11
Trotta|A|Sassuolo|9
Umar|A|Roma|6
Zapata D.|A|Udinese|17
Zarate|A|Fiorentina|12
Zaza|A|Juventus|16$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2016-17' and l.momento='partenza' and l.nome=p[1]);
