insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2019-20', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Alastra|P|Parma|1
Alfonso|P|Brescia|1
Andrenacci|P|Brescia|1
Angelo da Costa|P|Bologna|1
Aresti|P|Cagliari|1
Audero|P|Sampdoria|12
Avogadri|P|Sampdoria|1
Berardi A.|P|Hellas Verona|1
Berisha E.|P|SPAL|10
Berni|P|Inter|1
Bleve|P|Lecce|1
Buffon|P|Juventus|2
Colombi|P|Parma|1
Consigli|P|Sassuolo|11
Cragno|P|Cagliari|14
Daniel Fuzato|P|Roma|1
Donnarumma G.|P|Milan|18
Donnarumma A.|P|Milan|1
Dragowski|P|Fiorentina|13
Falcone|P|Sampdoria|1
Gabriel|P|Lecce|9
Ghidotti|P|Fiorentina|1
Gollini|P|Atalanta|15
Guerrieri|P|Lazio|1
Handanovic|P|Inter|20
Jandrei|P|Genoa|1
Joronen|P|Brescia|10
Karnezis|P|Napoli|1
Letica|P|SPAL|1
Marchetti|P|Genoa|1
Meneghetti|P|SPAL|1
Meret|P|Napoli|17
Mirante|P|Roma|1
Musso|P|Udinese|11
Nicolas|P|Udinese|1
Olsen R.|P|Roma|1
Ospina|P|Napoli|2
Padelli|P|Inter|1
Pau Lopez|P|Roma|16
Pegolo|P|Sassuolo|1
Pepe Reina|P|Milan|1
Perin|P|Juventus|1
Perisan|P|Udinese|1
Pinsoglio|P|Juventus|1
Plizzari|P|Milan|1
Proto|P|Lazio|1
Radu I.|P|Genoa|11
Radunovic|P|Hellas Verona|2
Rafael|P|Cagliari|1
Rosati|P|Torino|1
Rossi|P|Atalanta|1
Russo|P|Sassuolo|1
Sarr|P|Bologna|1
Sepe|P|Parma|10
Silvestri|P|Hellas Verona|8
Sirigu|P|Torino|17
Skorupski|P|Bologna|12
Sportiello|P|Atalanta|1
Strakosha|P|Lazio|15
Szczesny|P|Juventus|19
Terracciano|P|Fiorentina|1
Thiam|P|SPAL|1
Vigorito|P|Lecce|1
Vodisek|P|Genoa|1
Zaccagno|P|Torino|1
Acerbi|D|Lazio|16
Adjapong|D|Hellas Verona|5
Aina|D|Torino|9
Alan Empereur|D|Hellas Verona|3
Alex Sandro|D|Juventus|19
Asamoah|D|Inter|9
Augello|D|Sampdoria|3
Bani|D|Bologna|4
Barreca|D|Genoa|7
Bastoni|D|Inter|5
Bastos|D|Lazio|6
Benzar|D|Lecce|6
Bereszynski|D|Sampdoria|6
Biraghi|D|Fiorentina|9
Biraschi|D|Genoa|8
Bocchetti|D|Hellas Verona|6
Bonifazi|D|Torino|6
Bonucci|D|Juventus|16
Bremer|D|Torino|3
Bruno Alves|D|Parma|13
Cacciatore|D|Cagliari|7
Calabresi|D|Bologna|5
Calabria|D|Milan|10
Caldara|D|Milan|7
Calderoni|D|Lecce|5
Castagne|D|Atalanta|16
Ceccherini|D|Fiorentina|5
Ceppitelli|D|Cagliari|8
Cetin|D|Roma|4
Chabot|D|Sampdoria|4
Chancellor|D|Brescia|4
Chiellini|D|Juventus|17
Chiriches|D|Napoli|5
Cionek|D|SPAL|6
Cistana|D|Brescia|4
Colley|D|Sampdoria|7
Conti|D|Milan|9
Corbo|D|Bologna|1
Crescenzi|D|Hellas Verona|3
Criscito|D|Genoa|12
Dalbert Henrique|D|Inter|4
D'Ambrosio|D|Inter|9
Danilo Luiz|D|Juventus|11
Danilo La.|D|Bologna|9
Dawidowicz|D|Hellas Verona|4
de Ligt|D|Juventus|22
De Maio|D|Udinese|6
De Sciglio|D|Juventus|10
De Silvestri|D|Torino|12
de Vrij|D|Inter|19
Dell'Orco|D|Lecce|5
Demiral|D|Juventus|7
Denswil|D|Bologna|7
Depaoli|D|Sampdoria|5
Dermaku|D|Parma|3
Di Lorenzo|D|Napoli|15
Dickmann|D|SPAL|4
Dijks|D|Bologna|6
Dimarco|D|Inter|3
Djidji|D|Torino|6
Djimsiti|D|Atalanta|7
Dumancic|D|Lecce|1
Durmisi|D|Lazio|3
El Yamiq|D|Genoa|3
Faraoni|D|Hellas Verona|8
Fares|D|SPAL|10
Fazio|D|Roma|16
Felipe|D|SPAL|6
Felipe Curcio|D|Brescia|3
Ferrari G.|D|Sassuolo|13
Ferrari A.|D|Sampdoria|3
Fiamozzi|D|Lecce|3
Florenzi|D|Roma|17
Gabbia|D|Milan|1
Gagliolo|D|Parma|6
Gallo|D|Lecce|1
Gastaldello|D|Brescia|5
Ghiglione|D|Genoa|3
Ghoulam|D|Napoli|13
Godin|D|Inter|20
Goldaniga|D|Sassuolo|5
Gosens|D|Atalanta|13
Gravillon|D|Sassuolo|5
Gunter|D|Hellas Verona|4
Hateboer|D|Atalanta|18
Hernandez|D|Milan|11
Hysaj|D|Napoli|6
Iacoponi|D|Parma|5
Ibanez|D|Atalanta|3
Igor|D|SPAL|5
Izzo|D|Torino|18
Juan Jesus|D|Roma|5
Klavan|D|Cagliari|5
Kolarov|D|Roma|23
Koulibaly|D|Napoli|21
Kumbulla|D|Hellas Verona|1
Larsen|D|Udinese|10
Laurini|D|Parma|4
Laxalt|D|Milan|5
Leo Duarte|D|Milan|7
Lucioni|D|Lecce|7
Luiz Felipe|D|Lazio|7
Lukaku J.|D|Lazio|4
Luperto|D|Napoli|3
Lyanco|D|Torino|7
Lykogiannis|D|Cagliari|5
Magnani|D|Brescia|7
Maksimovic|D|Napoli|6
Malcuit|D|Napoli|7
Mancini|D|Roma|15
Mangraviti|D|Brescia|1
Manolas|D|Napoli|17
Mario Rui|D|Napoli|8
Marlon|D|Sassuolo|6
Martella|D|Brescia|8
Marusic|D|Lazio|7
Masiello|D|Atalanta|9
Mateju|D|Brescia|4
Mattiello|D|Cagliari|4
M'baye|D|Bologna|7
Meccariello|D|Lecce|4
Milenkovic|D|Fiorentina|12
Muldur|D|Sassuolo|4
Murillo|D|Sampdoria|8
Murru|D|Sampdoria|8
Musacchio|D|Milan|8
N'Koulou|D|Torino|15
Nuytinck|D|Udinese|5
Opoku|D|Udinese|4
Pajac|D|Genoa|5
Palomino|D|Atalanta|11
Patric|D|Lazio|4
Paz|D|Bologna|3
Pellegrini Lu.|D|Cagliari|5
Peluso|D|Sassuolo|5
Pezzella Gi.|D|Udinese|4
Pezzella Ge.|D|Fiorentina|14
Pinna|D|Cagliari|1
Pisacane|D|Cagliari|7
Pol Lirola|D|Fiorentina|11
Radu S.|D|Lazio|6
Rafael Toloi|D|Atalanta|10
Ranieri|D|Fiorentina|2
Ranocchia|D|Inter|4
Rasmussen|D|Fiorentina|4
Reca|D|Atalanta|4
Regini|D|Sampdoria|3
Riccardi|D|Lecce|1
Rispoli|D|Lecce|5
Rizzo|D|Genoa|1
Rodrigo Becao|D|Udinese|7
Rodriguez|D|Milan|8
Rogerio|D|Sassuolo|7
Romagna|D|Cagliari|4
Romagnoli|D|Milan|17
Romero|D|Genoa|11
Rossettini|D|Lecce|4
Rrahmani|D|Hellas Verona|6
Rugani|D|Juventus|6
Sabelli|D|Brescia|5
Sala|D|Sampdoria|3
Samir|D|Udinese|9
Santon|D|Roma|4
Semprini|D|Brescia|1
Sierralta|D|Udinese|3
Singo|D|Torino|1
Skriniar|D|Inter|17
Skrtel|D|Atalanta|12
Spinazzola|D|Roma|10
ter Avest|D|Udinese|4
Terzic|D|Fiorentina|3
Toljan|D|Sassuolo|8
Tomiyasu|D|Bologna|6
Tonelli|D|Napoli|4
Tripaldelli|D|Sassuolo|2
Troost-Ekong|D|Udinese|8
Varnier|D|Atalanta|2
Vavro|D|Lazio|8
Venuti|D|Fiorentina|6
Vera|D|Lecce|4
Vicari|D|SPAL|7
Vitale|D|Hellas Verona|5
Wallace|D|Lazio|3
Walukiewicz|D|Cagliari|2
Zapata C.|D|Genoa|7
Zappacosta|D|Roma|11
Agoume|C|Inter|1
Agudelo|C|Genoa|3
Agyemang-Badu|C|Hellas Verona|5
Alex Berenguer|C|Torino|13
Allan|C|Napoli|18
Andre Anderson|C|Lazio|2
Ansaldi|C|Torino|13
Badelj|C|Fiorentina|8
Balic|C|Udinese|5
Barak|C|Udinese|10
Barella|C|Inter|17
Barilla|C|Parma|11
Barreto|C|Sampdoria|5
Baselli|C|Torino|16
Beloko|C|Fiorentina|1
Benassi|C|Fiorentina|17
Bennacer|C|Milan|12
Bentancur|C|Juventus|13
Berisha V.|C|Lazio|5
Bernardeschi|C|Juventus|19
Biglia|C|Milan|8
Birsa|C|Cagliari|11
Bisoli|C|Brescia|12
Bonaventura|C|Milan|14
Borini|C|Milan|8
Borja Valero|C|Inter|7
Bourabia|C|Sassuolo|8
Bradaric|C|Cagliari|6
Brozovic|C|Inter|16
Brugman|C|Parma|8
Calhanoglu|C|Milan|16
Can|C|Juventus|16
Candreva|C|Inter|8
Capezzi|C|Sampdoria|3
Cassata|C|Genoa|5
Castro|C|Cagliari|14
Castrovilli|C|Fiorentina|6
Cataldi|C|Lazio|6
Chiesa|C|Fiorentina|25
Cigarini|C|Cagliari|8
Coric|C|Roma|4
Coulibaly|C|Udinese|4
Cristante|C|Roma|15
Cristobal Montiel|C|Fiorentina|1
Cristoforo|C|Fiorentina|4
Cuadrado|C|Juventus|12
Dabo|C|Fiorentina|6
D'Alessandro|C|SPAL|8
Daniel Bessa|C|Hellas Verona|10
Danzi|C|Hellas Verona|2
de Paul|C|Udinese|20
de Roon|C|Atalanta|16
Deiola|C|Cagliari|4
Dessena|C|Brescia|6
Diawara|C|Roma|9
Djuricic|C|Sassuolo|8
Douglas Costa|C|Juventus|18
Duncan|C|Sassuolo|15
Dzemaili|C|Bologna|9
Ekdal|C|Sampdoria|11
Elmas|C|Napoli|10
Espeto|C|SPAL|4
Eysseric|C|Fiorentina|6
Fabian Ruiz|C|Napoli|23
Farago|C|Cagliari|5
Fofana|C|Udinese|12
Freuler|C|Atalanta|17
Gaetano|C|Napoli|1
Gagliardini|C|Inter|10
Gomez|C|Atalanta|28
Gonalons|C|Roma|5
Grassi|C|Parma|6
Haye|C|Lecce|4
Henderson|C|Hellas Verona|6
Hernani|C|Parma|11
Hiljemark|C|Genoa|8
Ingelsson|C|Udinese|3
Ionita|C|Cagliari|10
Jagiello|C|Genoa|8
Jajalo|C|Udinese|7
Jankto|C|Sampdoria|11
Joao Mario|C|Inter|6
Jony|C|Lazio|12
Jose Callejon|C|Napoli|23
Kessie|C|Milan|20
Khedira|C|Juventus|12
Kluivert|C|Roma|16
Krejci|C|Bologna|4
Krunic|C|Milan|13
Kucka|C|Parma|15
Kulusevski|C|Parma|2
Kurtic|C|SPAL|16
Lazaro|C|Inter|14
Lazovic|C|Hellas Verona|10
Lazzari|C|Lazio|14
Lerager|C|Genoa|7
Leris|C|Sampdoria|5
Linetty|C|Sampdoria|14
Locatelli|C|Sassuolo|11
Lucas Felippe|C|Hellas Verona|1
Lucas Leiva|C|Lazio|13
Lucas Paqueta|C|Milan|19
Luis Alberto|C|Lazio|23
Lukic|C|Torino|7
Lulic|C|Lazio|16
Magnanelli|C|Sassuolo|6
Majer|C|Lecce|4
Malinovskiy|C|Atalanta|12
Mancosu|C|Lecce|13
Mandragora|C|Udinese|11
Maroni|C|Sampdoria|9
Marrone|C|Hellas Verona|3
Matuidi|C|Juventus|15
Mawuli|C|SPAL|1
Mazzitelli|C|Sassuolo|4
Meite|C|Torino|12
Michael|C|Bologna|2
Micin|C|Udinese|2
Miguel Veloso|C|Hellas Verona|7
Milinkovic-Savic|C|Lazio|25
Missiroli|C|SPAL|8
Munari|C|Parma|3
Murgia|C|SPAL|7
Nainggolan|C|Cagliari|17
Nandez|C|Cagliari|13
Ndoj|C|Brescia|7
Oliva|C|Cagliari|5
Olsen A.|C|Bologna|11
Pandev|C|Genoa|12
Parolo|C|Lazio|13
Pasalic|C|Atalanta|17
Pastore|C|Roma|13
Pedro Obiang|C|Sassuolo|8
Pellegrini Lo.|C|Roma|18
Pepin|C|Parma|4
Perotti|C|Roma|17
Pessina|C|Atalanta|4
Petriccione|C|Lecce|6
Pjanic|C|Juventus|21
Poli|C|Bologna|11
Pulgar|C|Fiorentina|17
Rabiot|C|Juventus|18
Radovanovic|C|Genoa|6
Ramirez|C|Sampdoria|15
Ramsey|C|Juventus|23
Ribery|C|Fiorentina|22
Rigoni|C|Parma|8
Rincon|C|Torino|13
Rog|C|Cagliari|9
Rômulo|C|Genoa|11
Samu Castillejo|C|Milan|12
Saponara|C|Genoa|9
Schone|C|Genoa|15
Schouten|C|Bologna|8
Scozzarella|C|Parma|6
Sensi|C|Inter|12
Shakhov|C|Lecce|10
Soriano|C|Bologna|13
Spalek|C|Brescia|9
Sturaro|C|Genoa|6
Suso|C|Milan|21
Svanberg|C|Bologna|5
Tabanelli|C|Lecce|6
Tachtsidis|C|Lecce|7
Thorsby|C|Sampdoria|8
Tonali|C|Brescia|11
Traore H.|C|Sassuolo|14
Tremolada|C|Brescia|5
Ünder|C|Roma|22
Valdifiori|C|SPAL|4
Valoti|C|SPAL|7
Valzania|C|Atalanta|5
Vecino|C|Inter|13
Verdi|C|Napoli|12
Veretout|C|Roma|17
Verre|C|Hellas Verona|7
Vieira Nan|C|Sampdoria|4
Viviani|C|Brescia|1
Walace|C|Udinese|7
Younes|C|Napoli|13
Zaccagni|C|Hellas Verona|7
Zaniolo|C|Roma|21
Zielinski|C|Napoli|21
Zmrhal|C|Brescia|10
Zurkowski|C|Fiorentina|7
Adekanye|A|Lazio|1
Adorante|A|Parma|1
Andre Silva|A|Milan|18
Antonucci|A|Roma|2
Aye|A|Brescia|13
Babacar|A|Sassuolo|11
Balotelli|A|Brescia|25
Baraye|A|Parma|3
Barrow|A|Atalanta|10
Belotti|A|Torino|31
Berardi D.|A|Sassuolo|20
Boateng|A|Fiorentina|19
Boga|A|Sassuolo|13
Bonazzoli|A|Sampdoria|7
Brignola|A|Sassuolo|7
Caicedo|A|Lazio|16
Caprari|A|Sampdoria|13
Caputo|A|Sassuolo|24
Ceravolo|A|Parma|7
Cerri|A|Cagliari|8
Cornelius|A|Parma|10
Correa|A|Lazio|21
Cristiano Ronaldo|A|Juventus|50
Defrel|A|Roma|17
Despodov|A|Cagliari|6
Destro|A|Bologna|13
Di Carmine|A|Hellas Verona|13
Di Francesco|A|SPAL|10
Di Gaudio|A|Hellas Verona|7
Diego Farias|A|Lecce|13
Donnarumma Alf.|A|Brescia|19
Dubickas|A|Lecce|1
Dybala|A|Juventus|30
Dzeko|A|Roma|27
Edera|A|Torino|5
Esposito|A|Inter|1
Falcinelli|A|Bologna|7
Falco|A|Lecce|10
Falletti|A|Bologna|6
Favilli|A|Genoa|8
Floccari|A|SPAL|11
Gabbiadini|A|Sampdoria|14
Gervinho|A|Parma|28
Gumus|A|Genoa|11
Han Kwang-Song|A|Cagliari|11
Higuain|A|Juventus|27
Iago Falque|A|Torino|25
Icardi|A|Inter|25
Ilicic|A|Atalanta|32
Immobile|A|Lazio|36
Inglese|A|Parma|21
Insigne|A|Napoli|31
Jankovic|A|SPAL|5
Joao Pedro|A|Cagliari|18
Karamoh|A|Parma|12
Kolaj|A|Sassuolo|1
Kouame|A|Genoa|14
La Mantia|A|Lecce|14
Lapadula|A|Lecce|13
Lasagna|A|Udinese|15
Lee Seung-Woo|A|Hellas Verona|4
Lo Faso|A|Lecce|3
Lozano|A|Napoli|27
Lukaku R.|A|Inter|34
Malle|A|Udinese|3
Mandzukic|A|Juventus|20
Martinez|A|Inter|28
Matri|A|Sassuolo|7
Mertens|A|Napoli|32
Milik|A|Napoli|33
Millico|A|Torino|2
Moncini|A|SPAL|13
Morosini|A|Brescia|7
Muriel|A|Atalanta|18
Nestorovski|A|Udinese|18
Orsolini|A|Bologna|22
Ounas|A|Napoli|10
Palacio|A|Bologna|16
Paloschi|A|SPAL|9
Parigini|A|Torino|5
Pavoletti|A|Cagliari|26
Pazzini|A|Hellas Verona|12
Petagna|A|SPAL|22
Piatek|A|Milan|37
Pinamonti|A|Genoa|16
Pjaca|A|Juventus|8
Politano|A|Inter|19
Pussetto|A|Udinese|12
Quagliarella|A|Sampdoria|36
Rafael Leao|A|Milan|21
Ragatzu|A|Cagliari|3
Ragusa|A|Hellas Verona|5
Raspadori|A|Sassuolo|1
Ryder Matos|A|Udinese|6
Sanabria|A|Genoa|13
Sansone|A|Bologna|15
Santander|A|Bologna|15
Schick|A|Roma|15
Siligardi|A|Parma|5
Simeone|A|Fiorentina|18
Sottil|A|Fiorentina|3
Sprocati|A|Parma|6
Teodorczyk|A|Udinese|10
Thereau|A|Fiorentina|9
Torregrossa|A|Brescia|12
Traore A.|A|Hellas Verona|1
Tupta|A|Hellas Verona|2
Tutino|A|Hellas Verona|5
Vlahovic|A|Fiorentina|4
Zapata D.|A|Atalanta|35
Zaza|A|Torino|13$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2019-20' and l.momento='partenza' and l.nome=p[1]);
