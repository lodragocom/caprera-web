-- Listone di partenza 2021-22, dal file Listone_Fantapazz INIZIO 2122 trovato dalla
-- Presidenza. Prima di oggi il listone di settembre esisteva solo per tre stagioni.
-- Le quotazioni sono quelle originali: il massimo e' 49, in linea con tutti gli altri
-- listoni dell'archivio. Il nome segue la convenzione di Fantapazz - solo il cognome
-- dove basta, cognome piu' iniziale dove ce ne sono due (Berardi A. il portiere del
-- Verona, Berardi D. l'attaccante del Sassuolo).
insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2021-22', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Adamonis|P|Lazio|1
Andrenacci|P|Genoa|1
Aresti|P|Cagliari|1
Audero|P|Sampdoria|14
Bardi|P|Bologna|1
Belec|P|Salernitana|8
Berardi A.|P|Verona|1
Berisha|P|Torino|2
Boer|P|Roma|1
Brignoli|P|Empoli|1
Bruno|P|Venezia|1
Consigli|P|Sassuolo|13
Cordaz|P|Inter|1
Cragno|P|Cagliari|15
Daniel Fuzato|P|Roma|1
Dragowski|P|Fiorentina|14
Falcone|P|Sampdoria|1
Fiorillo|P|Salernitana|1
Furlan|P|Empoli|1
Gemello|P|Torino|1
Guerrieri|P|Salernitana|1
Handanovic|P|Inter|20
Krapikas|P|Spezia|1
Lezzerini|P|Venezia|8
Maenpaa|P|Venezia|2
Maignan|P|Milan|19
Marchetti|P|Genoa|1
Marfella|P|Napoli|1
Meret|P|Napoli|17
Milinkovic-Savic V.|P|Torino|11
Montipo|P|Verona|11
Musso|P|Atalanta|18
Ospina|P|Napoli|2
Padelli|P|Udinese|1
Pandur|P|Verona|1
Pegolo|P|Sassuolo|1
Pepe Reina|P|Lazio|16
Perin|P|Juventus|1
Pinsoglio|P|Juventus|1
Plizzari|P|Milan|1
Provedel|P|Spezia|9
Radu I.|P|Inter|1
Radunovic|P|Cagliari|1
Ravaglia|P|Sampdoria|1
Rosati|P|Fiorentina|1
Rossi|P|Atalanta|1
Rui Patricio|P|Roma|17
Sarr|P|Bologna|1
Satalino|P|Sassuolo|1
Scuffet|P|Udinese|1
Semper|P|Genoa|1
Silvestri|P|Udinese|13
Sirigu|P|Genoa|1
Skorupski|P|Bologna|10
Sportiello|P|Atalanta|1
Strakosha|P|Lazio|2
Szczesny|P|Juventus|21
Tatarusanu|P|Milan|1
Terracciano|P|Fiorentina|1
Vicario|P|Empoli|9
Zoet|P|Spezia|2
Acerbi|D|Lazio|16
Adjapong|D|Sassuolo|3
Aina|D|Torino|6
Alan Empereur|D|Verona|4
Alex Sandro|D|Juventus|16
Altare|D|Cagliari|1
Amian Adou|D|Spezia|5
Amione|D|Verona|1
Ansaldi|D|Torino|13
Augello|D|Sampdoria|10
Aya|D|Salernitana|3
Ayhan|D|Sassuolo|6
Ballo-Toure|D|Milan|5
Bani|D|Genoa|6
Bastoni S.|D|Spezia|6
Bastoni A.|D|Inter|15
Bereszynski|D|Sampdoria|9
Binks|D|Bologna|3
Biraghi|D|Fiorentina|12
Biraschi|D|Genoa|5
Bogdan|D|Salernitana|5
Bonifazi|D|Bologna|7
Bonucci|D|Juventus|17
Bremer|D|Torino|17
Buongiorno|D|Torino|4
Calabria|D|Milan|15
Calafiori|D|Roma|4
Caldara|D|Venezia|5
Cambiaso|D|Genoa|2
Canestrelli|D|Empoli|1
Carboni|D|Cagliari|6
Casale|D|Verona|2
Ceccaroni|D|Venezia|5
Ceccherini|D|Verona|7
Ceppitelli|D|Cagliari|9
Cetin|D|Verona|3
Chabot|D|Sampdoria|5
Chiellini|D|Juventus|15
Chiriches|D|Sassuolo|7
Colley O.|D|Sampdoria|12
Colombini|D|Spezia|1
Conti|D|Milan|6
Corbo|D|Bologna|1
Criscito|D|Genoa|15
Cuadrado|D|Juventus|21
Czyborra|D|Genoa|5
Dalbert Henrique|D|Cagliari|6
D'Ambrosio|D|Inter|10
Danilo|D|Juventus|13
Darmian|D|Inter|13
Dawidowicz|D|Verona|6
de Ligt|D|Juventus|19
De Maio|D|Udinese|5
De Sciglio|D|Juventus|5
De Silvestri|D|Bologna|8
de Vrij|D|Inter|21
Demiral|D|Atalanta|11
Denswil|D|Bologna|4
Depaoli|D|Sampdoria|5
Di Lorenzo|D|Napoli|17
Dijks|D|Bologna|6
Dimarco|D|Inter|13
Djidji|D|Torino|5
Djimsiti|D|Atalanta|15
Dragusin|D|Juventus|1
Dumfries|D|Inter|17
Durmisi|D|Lazio|4
Ebuehi|D|Venezia|3
Erlic|D|Spezia|8
Farago|D|Cagliari|3
Faraoni|D|Verona|17
Fares|D|Lazio|7
Ferrari G.|D|Sassuolo|11
Ferrari A.|D|Sampdoria|4
Fiamozzi|D|Empoli|4
Florenzi|D|Milan|12
Frabotta|D|Verona|4
Gabbia|D|Milan|4
Ghoulam|D|Napoli|6
Godin|D|Cagliari|12
Goldaniga|D|Sassuolo|7
Gosens|D|Atalanta|30
Gunter|D|Verona|5
Gyomber|D|Salernitana|5
Hateboer|D|Atalanta|16
Hernandez|D|Milan|26
Hickey|D|Bologna|5
Hristov|D|Spezia|1
Hysaj|D|Lazio|9
Igor|D|Fiorentina|7
Ismajli|D|Empoli|7
Izzo|D|Torino|16
Jaroszynski|D|Salernitana|6
Juan|D|Napoli|4
Kaique Rocha|D|Sampdoria|1
Kalulu|D|Milan|5
Kamenovic|D|Lazio|4
Karsdorp|D|Roma|13
Kechrida|D|Salernitana|6
Kiriakopoulos|D|Sassuolo|8
Kjaer|D|Milan|16
Kolarov|D|Inter|8
Koulibaly|D|Napoli|17
Kumbulla|D|Roma|10
Lazzari|D|Lazio|14
Lovato|D|Atalanta|5
Luiz Felipe|D|Lazio|10
Luperto|D|Empoli|4
Lyanco|D|Torino|5
Lykogiannis|D|Cagliari|11
Maehle|D|Atalanta|15
Magnani|D|Verona|6
Malcuit|D|Napoli|5
Mancini|D|Roma|17
Manolas|D|Napoli|15
Marchizza|D|Empoli|5
Mario Rui|D|Napoli|9
Martinez L.|D|Fiorentina|8
Marusic|D|Lazio|8
Masiello|D|Genoa|8
Mazzocchi|D|Venezia|4
Mbaye|D|Bologna|5
Medel|D|Bologna|5
Milenkovic|D|Fiorentina|14
Modolo|D|Venezia|3
Molina|D|Udinese|10
Molinaro|D|Venezia|3
Muldur|D|Sassuolo|9
Murillo|D|Sampdoria|6
Murru|D|Sampdoria|5
Nikolaou|D|Spezia|5
Nuytinck|D|Udinese|13
Opoku|D|Udinese|3
Palomino|D|Atalanta|12
Paolo Ghiglione|D|Genoa|7
Parisi|D|Empoli|6
Patric|D|Lazio|6
Paz|D|Bologna|3
Pellegrini L.|D|Juventus|6
Peluso|D|Sassuolo|3
Pezzella|D|Atalanta|5
Pirrello|D|Empoli|1
Pol Lirola|D|Fiorentina|10
Radovanovic|D|Genoa|7
Radu S.|D|Lazio|9
Rafael Toloi|D|Atalanta|14
Ranieri|D|Fiorentina|4
Ranocchia|D|Inter|6
Reca|D|Atalanta|6
Reynolds|D|Roma|4
Rodrigo Becao|D|Udinese|8
Rodriguez|D|Torino|6
Roger Ibanez|D|Roma|11
Rogerio|D|Sassuolo|7
Romagna|D|Sassuolo|4
Romagnoli A.|D|Milan|12
Romagnoli S.|D|Empoli|6
Rrahmani|D|Napoli|8
Ruegg|D|Verona|3
Rugani|D|Juventus|7
Ruggeri|D|Salernitana|4
Sabelli|D|Genoa|5
Sala|D|Spezia|3
Salvador Ferrer|D|Spezia|5
Samir|D|Udinese|9
Schnegg|D|Venezia|5
Serpe|D|Genoa|1
Singo|D|Torino|10
Skriniar|D|Inter|20
Smalling|D|Roma|15
Soumaoro|D|Bologna|9
Spinazzola|D|Roma|8
Stojanovic|D|Empoli|6
Strandberg|D|Salernitana|4
Stryger Larsen|D|Udinese|13
Sutalo|D|Atalanta|5
Svoboda|D|Venezia|2
Terzic|D|Fiorentina|4
Toljan|D|Sassuolo|7
Tomiyasu|D|Bologna|12
Tomori|D|Milan|17
Tonelli|D|Sampdoria|7
Udogie|D|Udinese|2
Vanheusden|D|Genoa|7
Vasquez|D|Genoa|5
Vavro|D|Lazio|4
Venuti|D|Fiorentina|6
Veseli|D|Salernitana|4
Vignali|D|Spezia|4
Vina|D|Roma|9
Viti|D|Empoli|1
Vojvoda|D|Torino|8
Walukiewicz|D|Cagliari|5
Yoshida|D|Sampdoria|11
Zappa|D|Cagliari|8
Zeegelaar|D|Udinese|7
Zortea|D|Salernitana|5
Adrien Silva|C|Sampdoria|9
Agoume|C|Inter|2
Agudelo|C|Genoa|10
Akpa Akpro|C|Lazio|5
Ala-Myllymaki|C|Venezia|2
Amrabat|C|Fiorentina|13
Aramu|C|Venezia|11
Arslan|C|Udinese|11
Arthur|C|Juventus|12
Askildsen|C|Sampdoria|3
Asllani|C|Empoli|1
Badelj|C|Genoa|10
Bajrami|C|Empoli|13
Baldursson|C|Bologna|2
Bandinelli|C|Empoli|3
Barak|C|Verona|18
Barella|C|Inter|21
Baselli|C|Torino|10
Behrami|C|Genoa|6
Ben Lhassine Kone|C|Torino|2
Benassi|C|Fiorentina|2
Bennacer|C|Milan|13
Bentancur|C|Juventus|13
Bernardeschi|C|Juventus|13
Bianco|C|Fiorentina|1
Biancu|C|Cagliari|1
Bjarkason|C|Venezia|1
Bonaventura|C|Fiorentina|15
Bourabia|C|Sassuolo|7
Brahim Diaz|C|Milan|16
Brozovic|C|Inter|19
Busio|C|Venezia|7
Calhanoglu|C|Inter|24
Candreva|C|Sampdoria|19
Capezzi|C|Salernitana|6
Carles Perez|C|Roma|13
Cassata|C|Genoa|5
Castrovilli|C|Fiorentina|16
Cataldi|C|Lazio|7
Caviglia|C|Juventus|1
Cavion|C|Salernitana|4
Chiesa|C|Juventus|31
Coulibaly M.|C|Salernitana|5
Coulibaly L.|C|Salernitana|6
Cristante|C|Roma|12
Cristobal Montiel|C|Fiorentina|1
Crnigoj|C|Venezia|4
Crociata|C|Empoli|4
Da Riva|C|Atalanta|2
Damiani|C|Empoli|2
Damsgaard|C|Sampdoria|14
Daniel Bessa|C|Verona|9
Darboe|C|Roma|3
de Roon|C|Atalanta|17
Deiola|C|Cagliari|5
Demme|C|Napoli|13
Dezi|C|Venezia|4
Di Tacchio|C|Salernitana|5
Diawara|C|Roma|8
Djuricic|C|Sassuolo|18
Dominguez|C|Bologna|7
Donsah|C|Bologna|4
Duncan|C|Fiorentina|10
Ebongue|C|Genoa|1
Ekdal|C|Sampdoria|12
Elmas|C|Napoli|10
Emanuel Vignato|C|Bologna|11
Escalante|C|Lazio|6
Fabian Ruiz|C|Napoli|19
Fagioli|C|Juventus|1
Felipe Anderson|C|Lazio|17
Figoli|C|Spezia|1
Fiordilino|C|Venezia|3
Frattesi|C|Sassuolo|9
Freuler|C|Atalanta|19
Gaetano|C|Napoli|4
Gagliardini|C|Inter|12
Gonzalo Villar|C|Roma|11
Haas|C|Empoli|6
Haraslin|C|Sassuolo|7
Henderson|C|Empoli|6
Hernani|C|Genoa|14
Heymans|C|Venezia|7
Hongla|C|Verona|7
Ilic|C|Verona|10
Jajalo|C|Udinese|5
Jerdy Schouten|C|Bologna|10
Jony|C|Lazio|6
Jose Callejon|C|Fiorentina|13
Kastanos|C|Salernitana|5
Kessie|C|Milan|30
Kornvig|C|Spezia|4
Kovalenko|C|Spezia|12
Krunic|C|Milan|7
Kulusevski|C|Juventus|26
Kupisz|C|Salernitana|5
Ladinetti|C|Cagliari|1
Lazaro|C|Inter|8
Lazovic|C|Verona|16
Leo Sena|C|Spezia|6
Lerager|C|Genoa|7
Linetty|C|Torino|11
Lobotka|C|Napoli|6
Locatelli|C|Juventus|18
Lopez|C|Sassuolo|13
Lucas Leiva|C|Lazio|12
Luis Alberto|C|Lazio|28
Lukic|C|Torino|12
Machach|C|Napoli|4
Maggiore|C|Spezia|14
Magnanelli|C|Sassuolo|3
Makengo|C|Udinese|4
Maldini|C|Milan|1
Maleh|C|Fiorentina|8
Mandragora|C|Torino|15
Marin|C|Cagliari|16
Matheus Henrique|C|Sassuolo|8
McKennie|C|Juventus|15
Melegoni|C|Genoa|4
Michael|C|Bologna|1
Miguel Veloso|C|Verona|14
Milinkovic-Savic S.|C|Lazio|30
Mkhitaryan|C|Roma|32
Nandez|C|Cagliari|17
Obi|C|Salernitana|6
Oliva|C|Cagliari|6
Palumbo|C|Udinese|1
Pasalic|C|Atalanta|22
Pedro Obiang|C|Sassuolo|8
Pellegrini L.|C|Roma|25
Peretz|C|Venezia|6
Pereyra|C|Udinese|18
Perisic|C|Inter|16
Pessina|C|Atalanta|18
Pinato|C|Sassuolo|3
Pobega|C|Milan|8
Poli|C|Bologna|6
Portanova|C|Genoa|3
Pulgar|C|Fiorentina|12
Rabiot|C|Juventus|17
Ramsey|C|Juventus|14
Ricci|C|Empoli|8
Rincon|C|Torino|10
Rog|C|Cagliari|13
Romero|C|Lazio|2
Ronaldo Vieira|C|Sampdoria|5
Rovella|C|Genoa|9
Saelemaekers|C|Milan|15
Samardzic|C|Udinese|7
Samu Castillejo|C|Milan|11
Saponara|C|Fiorentina|9
Schiavone|C|Salernitana|3
Segre|C|Torino|6
Sensi|C|Inter|12
Sher|C|Spezia|3
Sigurdsson|C|Venezia|13
Skov Olsen|C|Bologna|13
Soriano|C|Bologna|24
Stojkovic|C|Torino|1
Strootman|C|Cagliari|14
Stulac|C|Empoli|10
Sturaro|C|Genoa|8
Svanberg|C|Bologna|14
Tameze|C|Verona|10
Taugourdeau|C|Venezia|5
Tessmann|C|Venezia|4
Thorsby|C|Sampdoria|15
Tonali|C|Milan|11
Traore|C|Sassuolo|15
Urbanski|C|Bologna|1
Vacca|C|Venezia|3
Vecino|C|Inter|10
Verdi|C|Torino|13
Veretout|C|Roma|27
Verre|C|Sampdoria|13
Vidal|C|Inter|14
Walace|C|Udinese|6
Zaccagni|C|Verona|17
Zalewski|C|Roma|1
Zaniolo|C|Roma|22
Zielinski|C|Napoli|27
Zurkowski|C|Empoli|7
Abraham|A|Roma|27
Adekanye|A|Lazio|3
Arnautovic|A|Bologna|23
Bahlouli|A|Sampdoria|2
Barrow|A|Bologna|22
Belotti|A|Torino|30
Berardi D.|A|Sassuolo|33
Bianchi|A|Genoa|1
Bocalon|A|Venezia|3
Boga|A|Sassuolo|22
Bonazzoli|A|Salernitana|12
Borja Mayoral|A|Roma|21
Buksa|A|Genoa|2
Caicedo|A|Lazio|17
Cancellieri|A|Verona|1
Caprari|A|Sampdoria|14
Caputo|A|Sassuolo|28
Ceter|A|Cagliari|6
Colidio|A|Inter|4
Colley E.|A|Spezia|8
Correa|A|Lazio|26
Cristiano Ronaldo|A|Juventus|49
Cristo Gonzalez|A|Udinese|5
Cutrone|A|Empoli|17
De Luca|A|Sampdoria|8
Defrel|A|Sassuolo|12
Destro|A|Genoa|17
Di Carmine|A|Verona|8
Di Mariano|A|Venezia|4
Djuric|A|Salernitana|8
Dybala|A|Juventus|31
Dzeko|A|Inter|27
Edera|A|Torino|7
Ekong|A|Empoli|1
Ekuban|A|Genoa|15
El Shaarawy|A|Roma|15
Favilli|A|Genoa|9
Felipe Vizeu|A|Udinese|4
Forestieri|A|Udinese|9
Forte|A|Venezia|9
Gabbiadini|A|Sampdoria|16
Gerard Deulofeu|A|Udinese|13
Giroud|A|Milan|22
Gonzalez|A|Fiorentina|19
Gyasi|A|Spezia|13
Iago Falque|A|Torino|12
Ibrahimovic|A|Milan|35
Ilicic|A|Atalanta|24
Immobile|A|Lazio|43
Insigne|A|Napoli|35
Joao Pedro Galvao|A|Cagliari|30
Johnsen|A|Venezia|5
Kaio Jorge|A|Juventus|13
Kalinic|A|Verona|12
Kallon|A|Genoa|1
Karlsson|A|Venezia|3
Kokorin|A|Fiorentina|14
Kristoffersen|A|Salernitana|2
La Mantia|A|Empoli|12
Lammers|A|Atalanta|12
Lasagna|A|Verona|15
Leao|A|Milan|17
Llorente|A|Udinese|13
Lozano|A|Napoli|27
Malinovskyi|A|Atalanta|28
Mancuso|A|Empoli|14
Martinez L.|A|Inter|33
Mertens|A|Napoli|24
Micin|A|Udinese|1
Millico|A|Torino|3
Miranchuk|A|Atalanta|16
Morata|A|Juventus|27
Mraz|A|Spezia|5
Muriel|A|Atalanta|36
Muriqi|A|Lazio|12
Nestorovski|A|Udinese|11
Nwankwo|A|Salernitana|28
N'Zola|A|Spezia|19
Oddei|A|Sassuolo|2
Okaka|A|Udinese|14
Okereke|A|Venezia|13
Orsolini|A|Bologna|19
Osimhen|A|Napoli|28
Ounas|A|Napoli|12
Pandev|A|Genoa|17
Pavoletti|A|Cagliari|17
Pedro|A|Lazio|15
Pereiro|A|Cagliari|9
Petagna|A|Napoli|14
Piccoli|A|Atalanta|10
Pinamonti|A|Inter|8
Piscopo|A|Empoli|1
Pjaca|A|Torino|12
Politano|A|Napoli|24
Pussetto|A|Udinese|12
Quagliarella|A|Sampdoria|27
Ragusa|A|Verona|5
Raspadori|A|Sassuolo|17
Raul Moro|A|Lazio|1
Rauti|A|Torino|2
Rebic|A|Milan|28
Ryder Matos|A|Udinese|5
Salcedo Mora|A|Inter|8
Sanabria|A|Torino|18
Sanchez|A|Inter|20
Sansone|A|Bologna|12
Santander|A|Bologna|8
Satriano|A|Inter|1
Scamacca|A|Sassuolo|14
Shomurodov|A|Roma|16
Simeone|A|Cagliari|16
Sottil|A|Fiorentina|11
Teodorczyk|A|Udinese|5
Torregrossa|A|Sampdoria|13
van Hooijdonk|A|Bologna|6
Verde|A|Spezia|16
Vlahovic|A|Fiorentina|34
Warming|A|Torino|4
Zapata|A|Atalanta|35
Zaza|A|Torino|14$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2021-22' and l.momento='partenza' and l.nome=p[1]);
