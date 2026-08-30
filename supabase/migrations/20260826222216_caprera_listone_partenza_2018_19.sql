-- Listone di partenza 2018-19. Massimo 60, che e' Cristiano Ronaldo appena arrivato.
insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2018-19', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Adamonis|P|Lazio|1
Angelo da Costa|P|Bologna|1
Aresti|P|Cagliari|1
Audero|P|Sampdoria|12
Bagheria|P|Parma|1
Bardi|P|Frosinone|1
Belec|P|Sampdoria|1
Berisha|P|Atalanta|13
Berni|P|Inter|1
Brancolini|P|Fiorentina|1
Caio Vinicius|P|Bologna|1
Cardinalli|P|Roma|1
Consigli|P|Sassuolo|11
Contini Baranovsky|P|Napoli|1
Coppola|P|Torino|1
Cragno|P|Cagliari|10
Daga|P|Cagliari|1
Daniel Fuzato|P|Roma|1
Dekic|P|Inter|1
Del Favero|P|Juventus|1
Donnarumma G.|P|Milan|12
Donnarumma A.|P|Milan|1
Dragowski|P|Fiorentina|1
Frattali|P|Parma|1
Fulignati|P|Empoli|1
Gasparini|P|Udinese|1
Ghidotti|P|Fiorentina|1
Gollini|P|Atalanta|2
Gomis|P|SPAL|2
Greco|P|Roma|1
Guarnone|P|Milan|1
Guerrieri|P|Lazio|1
Handanovic|P|Inter|16
Iacobucci|P|Frosinone|1
Ichazo|P|Torino|1
Karnezis|P|Napoli|3
Lafont|P|Fiorentina|11
Lobont|P|Roma|1
Loria|P|Juventus|1
Marchetti|P|Genoa|11
Marfella|P|Napoli|1
Meret|P|Napoli|13
Mirante|P|Roma|1
Musso|P|Udinese|9
Nicolas|P|Udinese|1
Olsen|P|Roma|15
Ospina|P|Napoli|2
Padelli|P|Inter|1
Palombo|P|Frosinone|1
Pegolo|P|Sassuolo|1
Pepe Reina|P|Milan|3
Perin|P|Juventus|2
Pinsoglio|P|Juventus|1
Pizzignacco|P|Udinese|1
Plizzari|P|Milan|1
Poluzzi|P|SPAL|1
Proto|P|Lazio|1
Provedel|P|Empoli|8
Radu I.|P|Genoa|1
Rafael|P|Sampdoria|1
Rafael|P|Cagliari|1
Rosati|P|Torino|1
Rossi F.|P|Atalanta|1
Russo A.|P|Genoa|1
Santurro|P|Bologna|1
Satalino|P|Sassuolo|1
Savic|P|SPAL|9
Scuffet|P|Udinese|1
Seculin|P|Chievo Verona|1
Semper|P|Chievo Verona|1
Sepe|P|Parma|9
Sirigu|P|Torino|13
Skorupski|P|Bologna|11
Soncin|P|Milan|1
Sorrentino|P|Chievo Verona|11
Sportiello|P|Frosinone|9
Strakosha|P|Lazio|12
Szczesny|P|Juventus|17
Terracciano|P|Empoli|1
Vargic|P|Lazio|1
Vodisek|P|Genoa|1
Zappino|P|Frosinone|1
Abate|D|Milan|3
Acerbi|D|Lazio|15
Adjapong|D|Sassuolo|5
Aina|D|Torino|6
Albiol|D|Napoli|15
Alex Sandro|D|Juventus|21
Ali Adnan|D|Atalanta|4
Andersen|D|Sampdoria|6
Andreolli|D|Cagliari|4
Angella|D|Udinese|3
Ansaldi|D|Torino|8
Antonelli|D|Empoli|3
Ariaudo|D|Frosinone|5
Asamoah|D|Inter|9
Bani|D|Chievo Verona|5
Barba|D|Chievo Verona|5
Barzagli|D|Juventus|7
Basta|D|Lazio|5
Bastoni|D|Parma|2
Bastos|D|Lazio|9
Bellanova|D|Milan|1
Benatia|D|Juventus|13
Bereszynski|D|Sampdoria|7
Bettella|D|Atalanta|1
Bianda|D|Roma|2
Biraghi|D|Fiorentina|9
Biraschi|D|Genoa|5
Bonifazi|D|SPAL|4
Bonucci|D|Juventus|16
Bremer|D|Torino|5
Brighenti|D|Frosinone|4
Bruno Alves|D|Parma|6
Cacciatore|D|Chievo Verona|7
Caceres|D|Lazio|10
Calabresi|D|Bologna|3
Calabria|D|Milan|7
Caldara|D|Milan|18
Capuano|D|Frosinone|4
Castagne|D|Atalanta|6
Ceccherini|D|Fiorentina|6
Ceppitelli|D|Cagliari|9
Cesar|D|Chievo Verona|3
Chiellini|D|Juventus|14
Chiriches|D|Napoli|4
Cionek|D|SPAL|7
Colley|D|Sampdoria|7
Conti|D|Milan|14
Corbo|D|Bologna|1
Costa|D|SPAL|6
Criscito|D|Genoa|13
Dalbert Henrique|D|Inter|5
D'Ambrosio|D|Inter|11
Danilo|D|Bologna|8
De Maio|D|Bologna|7
De Sciglio|D|Juventus|8
De Silvestri|D|Torino|15
de Vrij|D|Inter|22
Dell'Orco|D|Sassuolo|3
Di Cesare|D|Parma|5
Di Lorenzo|D|Empoli|5
Dickmann|D|SPAL|4
Dijks|D|Bologna|6
Diks|D|Fiorentina|5
Dimarco|D|Parma|3
Djidji|D|Torino|7
Djimsiti|D|Atalanta|4
Djourou|D|SPAL|7
Durmisi|D|Lazio|6
Farago|D|Cagliari|6
Fazio|D|Roma|15
Felipe|D|SPAL|6
Ferigra|D|Torino|1
Ferrari A.|D|Sampdoria|5
Ferrari G.|D|Sassuolo|10
Florenzi|D|Roma|16
Gagliolo|D|Parma|7
Gazzola|D|Parma|4
Ghiglione|D|Frosinone|1
Ghoulam|D|Napoli|14
Gobbi|D|Parma|4
Goldaniga|D|Frosinone|4
Gonzalez|D|Bologna|4
Gosens|D|Atalanta|5
Gunter|D|Genoa|3
Hancko|D|Fiorentina|3
Hateboer|D|Atalanta|6
Helander|D|Bologna|5
Hysaj|D|Napoli|10
Iacoponi|D|Parma|4
Ivan Marcano|D|Roma|10
Izzo|D|Torino|10
Jaroszynski|D|Chievo Verona|4
Joao Cancelo|D|Juventus|17
Joao Miranda|D|Inter|10
Juan Jesus|D|Roma|5
Junior Tavares|D|Sampdoria|6
Karsdorp|D|Roma|5
Klavan|D|Cagliari|6
Kolarov|D|Roma|21
Koulibaly|D|Napoli|21
Krajnc|D|Frosinone|3
Lakicevic|D|Genoa|4
Larsen|D|Udinese|6
Laurini|D|Fiorentina|4
Lemos|D|Sassuolo|8
Leverbe|D|Sampdoria|1
Lopez|D|Genoa|6
Luca Pellegrini|D|Roma|1
Luiz Felipe|D|Lazio|6
Lukaku|D|Lazio|8
Luperto|D|Napoli|3
Lyanco|D|Torino|4
Lykogiannis|D|Cagliari|6
Magnani|D|Sassuolo|2
Maietta|D|Empoli|5
Maksimovic|D|Napoli|5
Malcuit|D|Napoli|6
Mancini|D|Atalanta|5
Manolas|D|Roma|17
Marcjanik|D|Empoli|4
Mario Rui|D|Napoli|8
Marlon|D|Sassuolo|7
Marusic|D|Lazio|16
Masiello|D|Atalanta|16
Mattiello|D|Bologna|5
M'baye|D|Bologna|5
Milenkovic|D|Fiorentina|10
Molinaro|D|Frosinone|4
Moretti|D|Torino|6
Murru|D|Sampdoria|5
Musacchio|D|Milan|5
N'Koulou|D|Torino|13
Nuytinck|D|Udinese|5
Olivera|D|Fiorentina|3
Opoku|D|Udinese|3
Pajac|D|Cagliari|4
Palomino|D|Atalanta|7
Pasqual|D|Empoli|9
Patric|D|Lazio|5
Paz|D|Bologna|4
Pedro Pereira|D|Genoa|4
Peluso|D|Sassuolo|7
Pezzella Ge.|D|Fiorentina|11
Pezzella Gi.|D|Udinese|5
Pisacane|D|Cagliari|5
Pol Lirola|D|Sassuolo|5
Polvani|D|Empoli|2
Radu S.|D|Lazio|8
Rafael Toloi|D|Atalanta|10
Ranocchia|D|Inter|5
Rasmussen|D|Empoli|3
Reca|D|Atalanta|7
Regini|D|Sampdoria|4
Rodriguez|D|Milan|12
Rogerio|D|Sassuolo|3
Rolando|D|Sampdoria|3
Romagna|D|Cagliari|6
Romagnoli|D|Milan|15
Rossettini|D|Chievo Verona|4
Rugani|D|Juventus|9
Russo A.|D|Frosinone|2
Sala|D|Sampdoria|3
Salamon|D|Frosinone|4
Samir|D|Udinese|6
Santon|D|Roma|4
Scaglia|D|Parma|4
Sernicola|D|Sassuolo|1
Sierralta|D|Parma|2
Silvestre|D|Empoli|8
Simic L.|D|SPAL|4
Simic S.|D|Milan|2
Skriniar|D|Inter|20
Spinazzola|D|Juventus|8
Spolli|D|Genoa|6
Srna|D|Cagliari|11
Strinic|D|Milan|6
Tanasijevic|D|Chievo Verona|1
ter Avest|D|Udinese|5
Tomovic|D|Chievo Verona|5
Tonelli|D|Sampdoria|4
Tripaldelli|D|Sassuolo|1
Troost-Ekong|D|Udinese|7
Untersee|D|Empoli|3
Valjent|D|Chievo Verona|3
Varnier|D|Atalanta|4
Veseli|D|Empoli|4
Vicari|D|SPAL|5
Vitor Hugo|D|Fiorentina|8
Vrsaljko|D|Inter|13
Wague|D|Udinese|4
Wallace|D|Lazio|4
Zampano|D|Frosinone|5
Zapata C.|D|Milan|5
Zukanovic|D|Genoa|6
Acquah|C|Empoli|5
Agyemang-Badu|C|Udinese|5
Alex Berenguer|C|Torino|7
Allan|C|Napoli|19
Badelj|C|Lazio|11
Bakayoko|C|Milan|11
Balic|C|Udinese|6
Barak|C|Udinese|19
Barella|C|Cagliari|18
Barilla|C|Parma|6
Barreto|C|Sampdoria|7
Baselli|C|Torino|14
Beghetto|C|Frosinone|5
Behrami|C|Udinese|6
Benassi|C|Fiorentina|14
Bennacer|C|Empoli|9
Bentancur|C|Juventus|9
Bernardeschi|C|Juventus|17
Bertolacci|C|Milan|9
Besea|C|Frosinone|2
Biabiany|C|Parma|11
Biglia|C|Milan|13
Birsa|C|Chievo Verona|15
Boateng|C|Sassuolo|14
Bonaventura|C|Milan|21
Borini|C|Milan|8
Borja Valero|C|Inter|9
Bourabia|C|Sassuolo|6
Bradaric|C|Cagliari|9
Brighi|C|Empoli|4
Brozovic|C|Inter|18
Bruno Jordao|C|Lazio|1
Calhanoglu|C|Milan|23
Callegari|C|Genoa|1
Can|C|Juventus|19
Candreva|C|Inter|14
Capezzi|C|Empoli|5
Carriero|C|Parma|1
Cassata|C|Frosinone|3
Castro|C|Cagliari|15
Cataldi|C|Lazio|6
Chibsah|C|Frosinone|6
Chiesa|C|Fiorentina|21
Cigarini|C|Cagliari|9
Coric|C|Roma|9
Correa|C|Lazio|14
Coulibaly|C|Udinese|3
Crisetig|C|Frosinone|4
Cristante|C|Roma|23
Cristoforo|C|Fiorentina|3
Dabo|C|Fiorentina|9
D'Alessandro|C|Udinese|6
Daniel Bessa|C|Genoa|13
de Paul|C|Udinese|15
de Roon|C|Atalanta|13
De Rossi|C|Roma|12
Deiola|C|Parma|3
Depaoli|C|Chievo Verona|6
Dessena|C|Cagliari|4
Dezi|C|Parma|8
Diawara|C|Napoli|9
Djuricic|C|Sassuolo|9
Donsah|C|Bologna|8
Douglas Costa|C|Juventus|27
Duncan|C|Sassuolo|8
Dzemaili|C|Bologna|12
Ekdal|C|Sampdoria|9
Emanuel Vignato|C|Chievo Verona|1
Everton Luiz|C|SPAL|4
Eysseric|C|Fiorentina|10
Fabian Ruiz|C|Napoli|15
Fares|C|SPAL|5
Fernandes|C|Fiorentina|6
Fofana|C|Udinese|11
Freuler|C|Atalanta|18
Gagliardini|C|Inter|11
Gaudino|C|Chievo Verona|4
Gerson|C|Fiorentina|7
Giaccherini|C|Chievo Verona|17
Gonalons|C|Roma|6
Gori|C|Frosinone|3
Grassi|C|Parma|10
Halilovic|C|Milan|8
Hallfredsson|C|Frosinone|5
Hamsik|C|Napoli|23
Hetemaj|C|Chievo Verona|10
Hiljemark|C|Genoa|8
Ingelsson|C|Udinese|3
Ionita|C|Cagliari|8
Jankto|C|Sampdoria|16
Joao Mario|C|Inter|13
Joao Pedro|C|Cagliari|16
Juan Cuadrado|C|Juventus|21
Kessie|C|Milan|17
Khedira|C|Juventus|23
Kiyine|C|Chievo Verona|6
Krejci|C|Bologna|6
Krunic|C|Empoli|11
Kurtic|C|SPAL|10
Laxalt|C|Milan|12
Lazovic|C|Genoa|5
Lazzari|C|SPAL|13
Linetty|C|Sampdoria|13
Ljajic|C|Torino|22
Locatelli|C|Sassuolo|5
Lollo|C|Empoli|4
Lorenzo Pellegrini|C|Roma|16
Lucas Leiva|C|Lazio|15
Lukic|C|Torino|5
Lulic|C|Lazio|15
Magnanelli|C|Sassuolo|7
Maiello|C|Frosinone|5
Mandragora|C|Udinese|11
Matuidi|C|Juventus|15
Mauri|C|Milan|3
Mazzitelli|C|Genoa|6
Meite|C|Torino|6
Milinkovic-Savic|C|Lazio|29
Minala|C|Lazio|4
Missiroli|C|SPAL|7
Montolivo|C|Milan|4
Murgia|C|Lazio|5
Nagy|C|Bologna|5
Nainggolan|C|Inter|23
Nikolic|C|SPAL|1
Nørgaard|C|Fiorentina|6
N'Zonzi|C|Roma|12
Obi|C|Chievo Verona|10
Omeonga|C|Genoa|4
Padoin|C|Cagliari|6
Paganini|C|Frosinone|5
Parigini|C|Torino|5
Parolo|C|Lazio|17
Pasalic|C|Atalanta|14
Pastore|C|Roma|24
Pedro Neto|C|Lazio|1
Perisic|C|Inter|26
Perotti|C|Roma|19
Pessina|C|Atalanta|4
Pjanic|C|Juventus|24
Poli|C|Bologna|9
Pontisso|C|Udinese|1
Praet|C|Sampdoria|14
Pulgar|C|Bologna|10
Radovanovic|C|Chievo Verona|8
Ramirez|C|Sampdoria|15
Riccardi|C|Roma|1
Rigoni E.|C|Atalanta|13
Rigoni L.|C|Parma|8
Rigoni N.|C|Chievo Verona|5
Rincon|C|Torino|8
Rog|C|Napoli|6
Rolon|C|Genoa|4
Rômulo|C|Genoa|11
Sammarco|C|Frosinone|5
Samu Castillejo|C|Milan|15
Sandro|C|Genoa|13
Saponara|C|Sampdoria|11
Scavone|C|Parma|6
Schiattarella|C|SPAL|10
Scozzarella|C|Parma|5
Sensi|C|Sassuolo|6
Soddimo|C|Frosinone|7
Soriano|C|Torino|15
Stijepovic|C|Sampdoria|1
Strootman|C|Roma|13
Stulac|C|Parma|11
Svanberg|C|Bologna|4
Traore|C|Empoli|4
Ucan|C|Empoli|6
Ünder|C|Roma|26
Valdifiori|C|SPAL|4
Valencia|C|Bologna|2
Valon Berisha|C|Lazio|12
Valoti|C|SPAL|7
Valzania|C|Atalanta|5
Vecino|C|Inter|13
Veretout|C|Fiorentina|19
Vieira Nan|C|Sampdoria|7
Vitale|C|SPAL|2
Viviani|C|SPAL|11
Vloet|C|Frosinone|8
Younes|C|Napoli|11
Zajc|C|Empoli|13
Zaniolo|C|Roma|1
Zielinski|C|Napoli|18
Alejandro Rodriguez|A|Empoli|7
Antenucci|A|SPAL|18
Avenatti|A|Bologna|5
Babacar|A|Sassuolo|16
Balde|A|Inter|22
Baraye|A|Parma|6
Barrow|A|Atalanta|13
Belotti|A|Torino|30
Berardi|A|Sassuolo|17
Boga|A|Sassuolo|11
Brignola|A|Sassuolo|13
Butic|A|Torino|3
Caicedo|A|Lazio|10
Calaio|A|Parma|10
Campbell|A|Frosinone|11
Caprari|A|Sampdoria|11
Caputo|A|Empoli|18
Carlos|A|Napoli|3
Ceravolo|A|Parma|12
Cerri|A|Cagliari|13
Ciano|A|Frosinone|14
Ciciretti|A|Parma|10
Ciofani|A|Frosinone|13
Colidio|A|Inter|1
Cornelius|A|Atalanta|8
Cristiano Ronaldo|A|Juventus|60
Cutrone|A|Milan|24
da Cruz|A|Parma|5
Dalmonte|A|Genoa|6
Damascan|A|Torino|5
Defrel|A|Sampdoria|13
Destro|A|Bologna|14
Di Francesco|A|Sassuolo|11
Di Gaudio|A|Parma|9
Diego Farias|A|Cagliari|12
Dionisi|A|Frosinone|12
Djordjevic|A|Chievo Verona|13
Dybala|A|Juventus|37
Dzeko|A|Roma|34
Edera|A|Torino|8
El Shaarawy|A|Roma|18
Falcinelli|A|Bologna|13
Favilli|A|Genoa|5
Felipe Vizeu|A|Udinese|14
Floccari|A|SPAL|10
Gervinho|A|Parma|16
Gomez|A|Atalanta|24
Graiciar|A|Fiorentina|4
Higuain|A|Milan|33
Iago Falque|A|Torino|27
Icardi|A|Inter|40
Ilicic|A|Atalanta|26
Immobile|A|Lazio|39
Inglese|A|Parma|15
Insigne|A|Napoli|29
Iuri Medeiros|A|Genoa|12
Jakupovic|A|Empoli|2
Jose Callejon|A|Napoli|26
Karamoh|A|Inter|12
Kean|A|Juventus|9
Kluivert|A|Roma|20
Kouame|A|Genoa|13
Kownacki|A|Sampdoria|13
La Gumina|A|Empoli|12
Lapadula|A|Genoa|14
Lasagna|A|Udinese|23
Lautaro Martinez|A|Inter|25
Leris|A|Chievo Verona|2
Lombardi|A|Lazio|3
Luis Alberto|A|Lazio|29
Machis|A|Udinese|7
Mandzukic|A|Juventus|18
Matarese|A|Frosinone|2
Matri|A|Sassuolo|9
Mchedlidze|A|Empoli|5
Meggiorini|A|Chievo Verona|7
Mertens|A|Napoli|33
Micin|A|Udinese|4
Milik|A|Napoli|26
Mirallas|A|Fiorentina|15
Moncini|A|SPAL|9
Mraz|A|Empoli|8
Niang|A|Torino|13
Odgaard|A|Sassuolo|1
Okwonkwo|A|Bologna|7
Orsolini|A|Bologna|10
Ounas|A|Napoli|7
Palacio|A|Bologna|14
Paloschi|A|SPAL|14
Pandev|A|Genoa|13
Pavoletti|A|Cagliari|20
Pellissier|A|Chievo Verona|7
Perica|A|Frosinone|9
Petagna|A|SPAL|12
Piatek|A|Genoa|11
Pinamonti|A|Frosinone|3
Pjaca|A|Fiorentina|12
Politano|A|Inter|22
Pucciarelli|A|Chievo Verona|8
Pussetto|A|Udinese|12
Quagliarella|A|Sampdoria|25
Rossi A.|A|Lazio|4
Salcedo Mora|A|Inter|1
Santander|A|Bologna|14
Sau|A|Cagliari|12
Scamacca|A|Sassuolo|3
Schick|A|Roma|17
Siligardi|A|Parma|4
Simeone|A|Fiorentina|26
Sottil|A|Fiorentina|1
Sprocati|A|Parma|7
Stepinski|A|Chievo Verona|12
Suso|A|Milan|22
Teodorczyk|A|Udinese|16
Thereau|A|Fiorentina|14
Trotta|A|Sassuolo|12
Tumminello|A|Atalanta|7
Verdi|A|Napoli|18
Vlahovic|A|Fiorentina|2
Zanimacchia|A|Genoa|1
Zapata D.|A|Atalanta|19
Zaza|A|Torino|18
Zekhnini|A|Fiorentina|2$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2018-19' and l.momento='partenza' and l.nome=p[1]);
