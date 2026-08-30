-- Listone di partenza 2017-18. Massimo 37.
insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2017-18', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Alisson|P|Roma|14
Angelo da Costa|P|Bologna|1
Belec|P|Benevento|8
Berisha|P|Atalanta|13
Berni|P|Inter|1
Bizzarri|P|Udinese|2
Borsellini|P|Udinese|1
Brignoli|P|Benevento|1
Buffon|P|Juventus|16
Cerofolini|P|Fiorentina|1
Confente|P|Chievo Verona|1
Consigli|P|Sassuolo|12
Coppola|P|Hellas Verona|1
Cordaz|P|Crotone|10
Cragno|P|Cagliari|9
Crosta|P|Cagliari|1
Daga|P|Cagliari|1
Donnarumma G.|P|Milan|15
Donnarumma A.|P|Milan|1
Dragowski|P|Fiorentina|1
Festa|P|Crotone|1
Gabriel|P|Milan|1
Gollini|P|Atalanta|1
Gomis|P|SPAL|1
Guarnone|P|Milan|1
Guerrieri|P|Lazio|1
Handanovic|P|Inter|14
Ichazo|P|Torino|1
Karnezis|P|Udinese|1
Krapikas|P|Sampdoria|1
Lamanna|P|Genoa|1
Lobont|P|Roma|1
Marchegiani|P|SPAL|1
Marchetti|P|Lazio|1
Marson|P|Sassuolo|1
Meret|P|SPAL|9
Mirante|P|Bologna|10
Nicolas|P|Hellas Verona|9
Padelli|P|Inter|1
Pavoni|P|Chievo Verona|1
Pegolo|P|Sassuolo|1
Pepe Reina|P|Napoli|14
Perin|P|Genoa|12
Pinsoglio|P|Juventus|1
Piscitelli|P|Benevento|1
Poluzzi|P|SPAL|1
Puggioni|P|Sampdoria|1
Rafael|P|Cagliari|1
Rafael|P|Napoli|1
Ravaglia|P|Bologna|1
Rollandi|P|Genoa|1
Romagnoli A.|P|Roma|1
Rossi F.|P|Atalanta|1
Santurro|P|Bologna|1
Satalino|P|Sassuolo|1
Savic|P|Torino|1
Scuffet|P|Udinese|11
Seculin|P|Chievo Verona|1
Sepe|P|Napoli|1
Silvestri|P|Hellas Verona|1
Sirigu|P|Torino|12
Skorupski|P|Roma|1
Sorrentino|P|Chievo Verona|11
Sportiello|P|Fiorentina|12
Storari|P|Milan|1
Strakosha|P|Lazio|12
Szczesny|P|Juventus|1
Tozzo|P|Sampdoria|1
Vargic|P|Lazio|1
Viscovo|P|Crotone|1
Viviano|P|Sampdoria|12
Zima|P|Genoa|1
Abate|D|Milan|5
Abdullahi|D|Roma|1
Acerbi|D|Sassuolo|17
Adjapong|D|Sassuolo|3
Albiol|D|Napoli|10
Alex Sandro|D|Juventus|20
Ali Adnan|D|Udinese|3
Andreolli|D|Cagliari|5
Angella|D|Udinese|4
Ansaldi|D|Inter|6
Antei|D|Sassuolo|4
Antonelli|D|Milan|4
Arlind Ajeti|D|Crotone|4
Asamoah|D|Juventus|5
Astori|D|Fiorentina|11
Bani|D|Chievo Verona|3
Barreca|D|Torino|7
Barzagli|D|Juventus|12
Basta|D|Lazio|7
Bastoni|D|Atalanta|2
Bastos|D|Lazio|6
Benatia|D|Juventus|13
Bereszynski|D|Sampdoria|5
Bianchetti|D|Hellas Verona|4
Biraghi|D|Fiorentina|7
Biraschi|D|Genoa|4
Boccafoglia|D|SPAL|1
Bochniewicz|D|Udinese|1
Bonifazi|D|Torino|6
Bonucci|D|Milan|17
Brignani|D|Bologna|1
Bruno Gaspar|D|Fiorentina|6
Bruno Peres|D|Roma|8
Cabrera|D|Crotone|4
Cacciatore|D|Chievo Verona|7
Caceres|D|Hellas Verona|8
Calabria|D|Milan|3
Caldara|D|Atalanta|22
Camporese|D|Benevento|3
Cannavaro|D|Sassuolo|6
Capuano|D|Cagliari|4
Caracciolo|D|Hellas Verona|5
Castagne|D|Atalanta|5
Ceccherini|D|Crotone|5
Ceppitelli|D|Cagliari|4
Cesar|D|Chievo Verona|4
Cherubin|D|Hellas Verona|2
Chiellini|D|Juventus|16
Chiriches|D|Napoli|4
Conti|D|Milan|23
Costa F.|D|SPAL|6
Costa A.|D|Benevento|5
Cremonesi|D|SPAL|4
Cuomo|D|Crotone|1
Dainelli|D|Chievo Verona|5
Dalbert Henrique|D|Inter|10
D'Ambrosio|D|Inter|10
Danilo|D|Udinese|7
Danilo Avelar|D|Torino|3
De Maio|D|Bologna|4
De Sciglio|D|Juventus|7
De Silvestri|D|Torino|4
de Vrij|D|Lazio|15
Dell'Orco|D|Sassuolo|2
Depaoli|D|Chievo Verona|4
Di Chiara|D|Benevento|6
Djimsiti|D|Benevento|3
Dodô|D|Sampdoria|4
Dussenne|D|Crotone|3
Emerson|D|Roma|9
Erlic|D|Sassuolo|1
Faraoni|D|Crotone|4
Fazio|D|Roma|10
Felicioli|D|Hellas Verona|2
Felipe|D|SPAL|6
Ferrari G.|D|Sampdoria|1
Ferrari A.|D|Hellas Verona|3
Florenzi|D|Roma|17
Gabbia|D|Milan|1
Gamberini|D|Chievo Verona|6
Gasparetto|D|SPAL|2
Gastaldello|D|Bologna|6
Gazzola|D|Sassuolo|4
Gentiletti|D|Genoa|5
Ghoulam|D|Napoli|11
Gobbi|D|Chievo Verona|5
Goldaniga|D|Sassuolo|5
Gomez G.|D|Milan|3
Gonzalez|D|Bologna|5
Gosens|D|Atalanta|4
Gravillon|D|Benevento|2
Gyamfi|D|Benevento|2
Hateboer|D|Atalanta|4
Helander|D|Bologna|3
Heurtaux|D|Hellas Verona|6
Hoedt|D|Lazio|8
Hristov|D|Fiorentina|1
Hysaj|D|Napoli|8
Izzo|D|Genoa|7
Jaroszynski|D|Chievo Verona|4
Joao Miranda|D|Inter|13
Juan Jesus|D|Roma|4
Karsdorp|D|Roma|7
Kolarov|D|Roma|11
Konate|D|SPAL|5
Koulibaly|D|Napoli|16
Krafth|D|Bologna|4
Letizia|D|Benevento|5
Letschert|D|Sassuolo|3
Leverbe|D|Sampdoria|1
Lichtsteiner|D|Juventus|11
Lucioni|D|Benevento|5
Luiz Felipe|D|Lazio|2
Lukaku|D|Lazio|5
Lyanco|D|Torino|5
Maggio|D|Napoli|3
Maietta|D|Bologna|4
Maksimovic|D|Napoli|5
Mancini|D|Atalanta|3
Manolas|D|Roma|15
Marchizza|D|Sassuolo|1
Mario Rui|D|Napoli|6
Martella|D|Crotone|6
Marusic|D|Lazio|6
Masiello|D|Atalanta|11
Masina|D|Bologna|6
Mattiello|D|SPAL|4
M'baye|D|Bologna|3
Miangue|D|Cagliari|4
Milenkovic|D|Fiorentina|4
Molinaro|D|Torino|5
Moreno|D|Roma|12
Moretti|D|Torino|8
Murillo|D|Inter|7
Murru|D|Sampdoria|6
Musacchio|D|Milan|11
Nagatomo|D|Inter|3
Nicoletti|D|Crotone|1
N'Koulou|D|Torino|9
Nuytinck|D|Udinese|4
Oikonomou|D|SPAL|5
Olivera|D|Fiorentina|5
Paletta|D|Milan|6
Palomino|D|Atalanta|5
Patric|D|Lazio|4
Pavlovic|D|Sampdoria|5
Peluso|D|Sassuolo|6
Pezzella|D|Udinese|5
Pisacane|D|Cagliari|7
Pol Lirola|D|Sassuolo|5
Polvani|D|SPAL|1
Radu|D|Lazio|6
Rafael Toloi|D|Atalanta|9
Ranieri|D|Fiorentina|1
Ranocchia|D|Inter|4
Regini|D|Sampdoria|6
Rigione|D|Chievo Verona|3
Rodriguez R.|D|Milan|16
Romagna|D|Cagliari|3
Romagnoli A.|D|Milan|12
Rômulo|D|Hellas Verona|10
Rosi|D|Genoa|4
Rossettini|D|Genoa|4
Rugani|D|Juventus|9
Sala|D|Sampdoria|4
Salamon|D|Cagliari|3
Samir|D|Udinese|6
Sampirisi|D|Crotone|4
Santon|D|Inter|3
Silvestre|D|Sampdoria|9
Skriniar|D|Inter|8
Souprayen|D|Hellas Verona|4
Spolli|D|Genoa|4
Strinic|D|Napoli|4
Tomovic|D|Fiorentina|5
Tonelli|D|Napoli|6
Torosidis|D|Bologna|3
Vaisanen|D|SPAL|4
Venuti|D|Benevento|3
Vicari|D|SPAL|4
Vitor Hugo|D|Fiorentina|9
Wague|D|Udinese|4
Wallace|D|Lazio|6
Widmer|D|Udinese|9
Zapata C.|D|Milan|5
Zappacosta|D|Torino|14
Zukanovic|D|Genoa|6
Acquah|C|Torino|7
Alex Berenguer|C|Torino|8
Allan|C|Napoli|13
Alvarez|C|Sampdoria|8
Aramu|C|Torino|4
Badelj|C|Fiorentina|8
Balic|C|Udinese|4
Barak|C|Udinese|6
Barberis|C|Crotone|5
Barella|C|Cagliari|7
Barreto|C|Sampdoria|8
Baselli|C|Torino|13
Bastien|C|Chievo Verona|4
Baumgartner|C|Sampdoria|1
Behrami|C|Udinese|8
Benassi|C|Fiorentina|12
Bentancur|C|Juventus|6
Bernardeschi|C|Juventus|22
Bertolacci|C|Genoa|9
Biglia|C|Milan|14
Biondini|C|Sassuolo|4
Birsa|C|Chievo Verona|17
Bonaventura|C|Milan|16
Borja Valero|C|Inter|15
Brozovic|C|Inter|10
Buchel|C|Hellas Verona|6
Calhanoglu|C|Milan|21
Candreva|C|Inter|19
Capezzi|C|Sampdoria|4
Cassata|C|Sassuolo|3
Castro|C|Chievo Verona|14
Cataldi|C|Benevento|6
Chibsah|C|Benevento|7
Chiesa|C|Fiorentina|15
Ciciretti|C|Benevento|12
Cigarini|C|Cagliari|6
Cofie|C|Genoa|3
Cossu|C|Cagliari|3
Crecco|C|Lazio|3
Crisetig|C|Bologna|4
Cristante|C|Atalanta|7
Cristoforo|C|Fiorentina|3
Crociata|C|Crotone|2
Cuadrado|C|Juventus|15
D'Alessandro|C|Benevento|8
Daniel Bessa|C|Hellas Verona|11
de Paul|C|Udinese|12
de Roon|C|Atalanta|11
De Rossi|C|Roma|13
Deiola|C|Cagliari|3
Del Pinto|C|Benevento|2
Dessena|C|Cagliari|5
Di Gennaro|C|Lazio|9
Diawara|C|Napoli|8
Djuricic|C|Sampdoria|6
Donsah|C|Bologna|5
Douglas Costa|C|Juventus|21
Duncan|C|Sassuolo|10
Emanuel Vignato|C|Chievo Verona|1
Eramo|C|Benevento|4
Ewandro|C|Udinese|3
Eysseric|C|Fiorentina|12
Falco|C|Bologna|5
Falletti|C|Bologna|8
Farago|C|Cagliari|5
Fares|C|Hellas Verona|3
Felipe Anderson|C|Lazio|18
Fernandez|C|Fiorentina|5
Fofana|C|Udinese|13
Fossati|C|Hellas Verona|6
Frattesi|C|Sassuolo|1
Freuler|C|Atalanta|13
Gagliardini|C|Inter|12
Garritano|C|Chievo Verona|5
Gaudino|C|Chievo Verona|4
Gerson|C|Roma|3
Giaccherini|C|Napoli|7
Gil Dias|C|Fiorentina|9
Gonalons|C|Roma|7
Grassi|C|SPAL|6
Haas|C|Atalanta|4
Hagi|C|Fiorentina|3
Hallfredsson|C|Udinese|6
Hamsik|C|Napoli|26
Hetemaj|C|Chievo Verona|6
Hiljemark|C|Genoa|6
Iago Falque|C|Torino|24
Ilicic|C|Atalanta|18
Ingelsson|C|Udinese|3
Ionita|C|Cagliari|11
Izco|C|Crotone|5
Jankto|C|Udinese|12
Joao Mario|C|Inter|14
Joao Pedro|C|Cagliari|16
Joao Schmidt|C|Atalanta|3
Jorginho|C|Napoli|11
Kessie|C|Milan|18
Khedira|C|Juventus|17
Kiyine|C|Chievo Verona|1
Kondogbia|C|Inter|9
Kone|C|Udinese|6
Kragl|C|Crotone|6
Krejci|C|Bologna|10
Kurtic|C|Atalanta|11
Laxalt|C|Genoa|10
Lazovic|C|Genoa|8
Lazzari|C|SPAL|7
Linetty|C|Sampdoria|10
Ljajic|C|Torino|23
Locatelli|C|Milan|5
Lorenzo Pellegrini|C|Roma|12
Lucas Leiva|C|Lazio|6
Luis Alberto|C|Lazio|7
Lulic|C|Lazio|14
Magnanelli|C|Sassuolo|7
Malle|C|Udinese|3
Mandragora|C|Crotone|3
Marchisio|C|Juventus|11
Matuidi|C|Juventus|17
Mauri|C|Milan|3
Mazzitelli|C|Sassuolo|6
Melegoni|C|Atalanta|2
Miguel Veloso|C|Genoa|7
Milinkovic-Savic|C|Lazio|16
Missiroli|C|Sassuolo|8
Montolivo|C|Milan|5
Mora|C|SPAL|9
Mounier|C|Bologna|4
Murgia|C|Lazio|5
Nagy|C|Bologna|4
Nainggolan|C|Roma|24
Nalini|C|Crotone|6
Ninkovic|C|Genoa|6
Obi|C|Torino|4
Padoin|C|Cagliari|5
Parolo|C|Lazio|15
Perisic|C|Inter|23
Perotti|C|Roma|21
Pessina|C|Atalanta|2
Pjanic|C|Juventus|22
Poli|C|Bologna|4
Praet|C|Sampdoria|7
Pulgar|C|Bologna|3
Radovanovic|C|Chievo Verona|7
Ramirez|C|Sampdoria|14
Rigoni L.|C|Genoa|11
Rigoni N.|C|Chievo Verona|5
Rincon|C|Torino|6
Rizzo|C|SPAL|5
Rodriguez T.|C|Genoa|4
Rog|C|Napoli|7
Rohden|C|Crotone|7
Samuel Gustafson|C|Torino|3
Sanchez|C|Fiorentina|6
Saponara|C|Fiorentina|15
Schetino|C|Fiorentina|1
Schiattarella|C|SPAL|8
Schiavon|C|SPAL|3
Sensi|C|Sassuolo|6
Sosa|C|Milan|4
Spinazzola|C|Atalanta|11
Stoian|C|Crotone|8
Strootman|C|Roma|18
Sturaro|C|Juventus|5
Suljic|C|Crotone|1
Taider|C|Bologna|8
Torreira|C|Sampdoria|7
Ünder|C|Roma|7
Valdifiori|C|Torino|4
Valencia|C|Bologna|2
Valoti|C|Hellas Verona|5
Vecino|C|Inter|13
Veretout|C|Fiorentina|10
Verre|C|Sampdoria|4
Viola|C|Benevento|6
Viviani|C|SPAL|7
Zaccagni|C|Hellas Verona|3
Zekhnini|C|Fiorentina|4
Zielinski|C|Napoli|14
Zuculini B.|C|Hellas Verona|6
Zuculini F.|C|Hellas Verona|4
Acosty|A|Crotone|5
Alejandro Rodriguez|A|Chievo Verona|8
Andre Silva|A|Milan|23
Antenucci|A|SPAL|14
Babacar|A|Fiorentina|15
Baez|A|Fiorentina|3
Bajic|A|Udinese|14
Balde|A|Lazio|27
Belotti|A|Torino|34
Berardi|A|Sassuolo|25
Bonazzoli|A|Sampdoria|5
Borello|A|Crotone|1
Borini|A|Milan|6
Borriello|A|Cagliari|24
Boye|A|Torino|7
Budimir|A|Crotone|15
Caicedo|A|Lazio|13
Caprari|A|Sampdoria|13
Centurion|A|Genoa|9
Ceravolo|A|Benevento|14
Cerci|A|Hellas Verona|14
Cisse|A|Benevento|6
Coda|A|Benevento|14
Cop|A|Cagliari|11
Cornelius|A|Atalanta|12
Cutrone|A|Milan|1
Defrel|A|Roma|17
Destro|A|Bologna|18
Di Francesco|A|Bologna|10
Diego Farias|A|Cagliari|14
Djordjevic|A|Lazio|10
Dybala|A|Juventus|32
Dzeko|A|Roma|34
Edera|A|Torino|1
El Shaarawy|A|Roma|18
Falcinelli|A|Sassuolo|18
Floccari|A|SPAL|14
Gabriel|A|Inter|11
Gakpe|A|Genoa|4
Galabinov|A|Genoa|13
Giannetti|A|Cagliari|7
Gomez A.|A|Atalanta|28
Higuain|A|Juventus|37
Icardi|A|Inter|35
Iemmello|A|Sassuolo|11
Immobile|A|Lazio|32
Inglese|A|Chievo Verona|17
Insigne|A|Napoli|30
Jose Callejon|A|Napoli|26
Jovetic|A|Inter|13
Kalinic|A|Fiorentina|24
Kean|A|Juventus|6
Kishna|A|Lazio|6
Kotnik|A|Crotone|4
Kownacki|A|Sampdoria|7
Lapadula|A|Genoa|15
Lasagna|A|Udinese|13
Leandrinho|A|Napoli|2
Leris|A|Chievo Verona|1
Lombardi|A|Lazio|4
Mandzukic|A|Juventus|17
Martins|A|Inter|16
Matri|A|Sassuolo|16
Meggiorini|A|Chievo Verona|12
Melchiorri|A|Cagliari|8
Mertens|A|Napoli|35
Milik|A|Napoli|20
Niang|A|Milan|13
Nwankwo|A|Crotone|7
Okwonkwo|A|Bologna|3
Orsolini|A|Atalanta|10
Ounas|A|Napoli|9
Palacio|A|Bologna|13
Palladino|A|Genoa|7
Palombi|A|Lazio|8
Paloschi|A|SPAL|14
Pandev|A|Genoa|9
Parigini|A|Torino|4
Pavoletti|A|Napoli|15
Pazzini|A|Hellas Verona|19
Pellegri|A|Genoa|3
Pellissier|A|Chievo Verona|13
Perica|A|Udinese|13
Petagna|A|Atalanta|16
Petkovic|A|Bologna|8
Pierini|A|Sassuolo|1
Pinamonti|A|Inter|5
Pjaca|A|Juventus|12
Politano|A|Sassuolo|16
Pucciarelli|A|Chievo Verona|11
Puscas|A|Benevento|10
Quagliarella|A|Sampdoria|18
Ragusa|A|Sassuolo|8
Rebic|A|Fiorentina|4
Ricci|A|Sassuolo|6
Rossi A.|A|Lazio|1
Ryder Matos|A|Udinese|4
Salcedo Mora|A|Genoa|1
Sau|A|Cagliari|13
Schick|A|Sampdoria|20
Simeone|A|Fiorentina|21
Suso|A|Milan|20
Taarabt|A|Genoa|8
Thereau|A|Udinese|18
Tonev|A|Crotone|5
Trotta|A|Crotone|11
Tumminello|A|Roma|1
Tupta|A|Hellas Verona|1
Umar|A|Torino|6
Verde|A|Hellas Verona|8
Verdi|A|Bologna|18
Vido|A|Atalanta|6
Zapata D.|A|Napoli|14$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2017-18' and l.momento='partenza' and l.nome=p[1]);
