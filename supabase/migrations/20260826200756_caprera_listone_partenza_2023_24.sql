-- Listone di partenza 2023-24. Scala normale, massimo 50: nessuna conversione.
-- Con questo il listone di settembre passa da tre stagioni a sei.
insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2023-24', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Adamonis|P|Lazio|1
Allocca|P|Salernitana|1
Aresti|P|Cagliari|1
Audero|P|Inter|1
Bagnolini|P|Bologna|1
Berardi A.|P|Verona|1
Berisha E.|P|Torino|1
Bleve|P|Lecce|1
Boer|P|Roma|1
Borbei|P|Lecce|1
Brancolini|P|Lecce|1
Caprile|P|Empoli|11
Carnesecchi|P|Atalanta|13
Cerofolini|P|Frosinone|1
Chiesa M.|P|Verona|1
Chiorra|P|Empoli|1
Christensen|P|Fiorentina|1
Ciocci|P|Cagliari|1
Consigli|P|Sassuolo|9
Contini Baranovsky|P|Napoli|1
Costil|P|Salernitana|1
Cragno|P|Sassuolo|1
Di Gennaro|P|Inter|1
Di Gregorio|P|Monza|13
Falcone|P|Lecce|11
Fiorenza|P|Torino|1
Fiorillo|P|Salernitana|1
Furlanetto|P|Lazio|1
Gemello|P|Torino|1
Gollini|P|Napoli|1
Gori S.|P|Monza|1
Idasiak|P|Napoli|1
Jacopo De Matteis|P|Salernitana|1
Josep Martinez|P|Genoa|11
Lamanna|P|Monza|1
Leali|P|Genoa|1
Maignan|P|Milan|20
Marfella|P|Napoli|1
Meret|P|Napoli|20
Milinkovic-Savic|P|Torino|12
Mirante|P|Milan|1
Montipo|P|Verona|9
Musso|P|Atalanta|1
Ochoa|P|Salernitana|12
Padelli|P|Udinese|1
Palmisani|P|Frosinone|1
Pegolo|P|Sassuolo|1
Perilli|P|Verona|1
Perin|P|Juventus|2
Perisan|P|Empoli|1
Piana|P|Udinese|1
Pinsoglio|P|Juventus|1
Popa|P|Torino|1
Provedel|P|Lazio|19
Radunovic|P|Cagliari|10
Ravaglia|P|Bologna|1
Rossi|P|Atalanta|1
Rui Patricio|P|Roma|17
Russo|P|Sassuolo|1
Samooja|P|Lecce|1
Scuffet|P|Cagliari|1
Sepe|P|Salernitana|1
Silvestri|P|Udinese|11
Skorupski|P|Bologna|12
Sommariva|P|Genoa|1
Sommer|P|Inter|20
Sorrentino|P|Monza|1
Sportiello|P|Milan|1
Stubljar|P|Empoli|1
Svilar|P|Roma|1
Szczesny|P|Juventus|20
Terracciano P.|P|Fiorentina|13
Turati|P|Frosinone|10
Ujkani|P|Empoli|1
Vettorel|P|Frosinone|1
Viola A.|P|Lecce|1
Aaron Martin|D|Genoa|9
Abankwah|D|Udinese|1
Acerbi|D|Inter|11
Alex Sandro|D|Juventus|10
Altare|D|Cagliari|7
Amey|D|Bologna|1
Amione|D|Verona|4
Anastasio|D|Monza|1
Antov|D|Monza|4
Armini|D|Lazio|1
Augello|D|Cagliari|9
Bakker|D|Atalanta|12
Ballo-Toure|D|Milan|4
Bani|D|Genoa|8
Barreca|D|Cagliari|5
Baschirotto|D|Lecce|12
Bastoni|D|Inter|15
Bayeye|D|Torino|2
Bellanova|D|Torino|7
Bettella|D|Monza|4
Beukema|D|Bologna|8
Bijol|D|Udinese|11
Binks|D|Bologna|1
Biraghi|D|Fiorentina|12
Biraschi|D|Genoa|6
Birindelli|D|Monza|7
Bisseck|D|Inter|5
Bogdan|D|Salernitana|3
Bonfanti|D|Atalanta|1
Bonifazi|D|Bologna|3
Bonucci|D|Juventus|10
Bradaric|D|Salernitana|10
Bremer|D|Juventus|16
Bronn|D|Salernitana|5
Buongiorno|D|Torino|12
Cabal|D|Verona|5
Cacace|D|Empoli|6
Calabria|D|Milan|14
Caldara|D|Milan|4
Caldirola|D|Monza|8
Cambiaso|D|Juventus|8
Capradossi|D|Cagliari|3
Carboni F.|D|Monza|3
Carboni A.|D|Monza|7
Carlos|D|Inter|16
Casale|D|Lazio|11
Celik|D|Roma|9
Cittadini|D|Monza|5
Coppola|D|Verona|3
Corazza|D|Bologna|1
Cuadrado|D|Inter|12
Dalle Mura|D|Fiorentina|1
D'Ambrosio|D|Monza|6
Daniliuc|D|Salernitana|7
Danilo|D|Juventus|17
Darmian|D|Inter|10
Dawidowicz|D|Verona|7
De Sciglio|D|Juventus|7
De Silvestri|D|Bologna|7
de Vrij|D|Inter|9
De Winter|D|Genoa|4
Dellavalle|D|Torino|1
Dembele|D|Torino|1
Dermaku|D|Lecce|2
Di Lorenzo|D|Napoli|17
Di Pardo|D|Cagliari|2
Diego Llorente|D|Roma|8
Dimarco|D|Inter|19
Djidji|D|Torino|8
Djimsiti|D|Atalanta|9
Dodô|D|Fiorentina|12
Doig|D|Verona|9
Donati|D|Monza|5
Dorgu|D|Lecce|1
Dossena|D|Cagliari|7
Dragusin|D|Genoa|9
Dumfries|D|Inter|15
Ebosele|D|Udinese|7
Ebosse|D|Udinese|4
Ebuehi|D|Empoli|9
Ehizibue|D|Udinese|8
Erlic|D|Sassuolo|8
Faraoni|D|Verona|13
Fares|D|Lazio|5
Fazio|D|Salernitana|6
Ferrari|D|Sassuolo|8
Florenzi|D|Milan|7
Frabotta|D|Juventus|1
Gallo|D|Lecce|6
Gatti|D|Juventus|7
Gendrey|D|Lecce|7
Goldaniga|D|Cagliari|4
Gonzalez F.|D|Juventus|3
Guarino|D|Empoli|1
Guessand|D|Udinese|1
Gunter|D|Verona|6
Gyomber|D|Salernitana|7
Hateboer|D|Atalanta|7
Hefti|D|Genoa|7
Hernandez|D|Milan|20
Hien|D|Verona|8
Huijsen|D|Juventus|1
Hysaj|D|Lazio|8
Ismajli|D|Empoli|7
Izzo|D|Monza|9
Jaroszynski|D|Salernitana|4
Joao Ferreira|D|Udinese|4
Juan Jesus|D|Napoli|6
Kabasele|D|Udinese|7
Kalaj|D|Frosinone|4
Kalulu|D|Milan|12
Kamara|D|Udinese|6
Kamenovic|D|Lazio|2
Karsdorp|D|Roma|9
Kayode|D|Fiorentina|1
Kjaer|D|Milan|11
Klitten|D|Frosinone|4
Kolasinac|D|Atalanta|9
Kristensen|D|Roma|8
Kumbulla|D|Roma|6
Kyriakopoulos|D|Monza|8
Lazaro|D|Inter|7
Lazzari|D|Lazio|8
Lemmens|D|Lecce|1
Leonardo Buta|D|Udinese|4
Lovato|D|Salernitana|5
Lucumi|D|Bologna|9
Luperto|D|Empoli|8
Lykogiannis|D|Bologna|7
Macej|D|Frosinone|1
Magnani|D|Verona|6
Mancini|D|Roma|13
Mantovani|D|Salernitana|3
Marchizza|D|Frosinone|5
Marianucci|D|Empoli|1
Mario Gila|D|Lazio|4
Mario Rui|D|Napoli|11
Martinez L.|D|Fiorentina|9
Marusic|D|Lazio|9
Masina|D|Udinese|6
Matturro|D|Genoa|1
Mazzocchi|D|Salernitana|12
Milenkovic|D|Fiorentina|12
Mina|D|Fiorentina|8
Miranda|D|Sassuolo|1
Missori|D|Sassuolo|2
Monterisi|D|Frosinone|3
Motoc|D|Salernitana|1
Natan|D|Napoli|7
N'Dicka|D|Roma|12
N'Guessan|D|Torino|1
Nwachukwu|D|Udinese|1
Obert|D|Cagliari|4
Okoli|D|Atalanta|3
Olivera|D|Napoli|10
Østigård|D|Napoli|6
Oyono|D|Frosinone|7
Pablo Mari|D|Monza|9
Pajac|D|Genoa|5
Palomino|D|Atalanta|6
Parisi|D|Fiorentina|12
Patric|D|Lazio|6
Paulo Dentello|D|Cagliari|6
Paz|D|Sassuolo|3
Pedro Pereira|D|Monza|6
Pellegrini L.|D|Lazio|7
Perez|D|Udinese|10
Pezzella|D|Empoli|7
Pierozzi|D|Fiorentina|1
Pirola|D|Salernitana|7
Pongracic|D|Lecce|7
Posch|D|Bologna|15
Rafael Toloi|D|Atalanta|11
Ranieri|D|Fiorentina|4
Rodriguez|D|Torino|11
Romagnoli S.|D|Frosinone|4
Romagnoli A.|D|Lazio|12
Rrahmani|D|Napoli|14
Ruan|D|Sassuolo|4
Ruegg|D|Verona|1
Rugani|D|Juventus|5
Ruggeri|D|Atalanta|4
Sabelli|D|Genoa|9
Saccani|D|Sassuolo|1
Sambia|D|Salernitana|6
Sampirisi|D|Monza|5
Scalvini|D|Atalanta|11
Schuurs|D|Torino|12
Smajlovic|D|Lecce|1
Smalling|D|Roma|16
Soppy|D|Atalanta|4
Sosa|D|Bologna|4
Soumaoro|D|Bologna|4
Spinazzola|D|Roma|15
Stabile|D|Inter|1
Stivanello|D|Bologna|1
Stojanovic|D|Empoli|6
Szyminski|D|Frosinone|5
Terracciano F.|D|Verona|4
Thiaw|D|Milan|12
Toljan|D|Sassuolo|6
Tomori|D|Milan|13
Tonelli|D|Empoli|4
Vasquez|D|Genoa|7
Venuti|D|Lecce|6
Vina|D|Sassuolo|5
Viti|D|Sassuolo|6
Vogliacco|D|Genoa|7
Vojvoda|D|Torino|9
Walukiewicz|D|Empoli|5
Zanoli|D|Napoli|6
Zappa|D|Cagliari|8
Zappacosta|D|Atalanta|13
Zeegelaar|D|Udinese|5
Zemura|D|Udinese|5
Zima|D|Torino|5
Zortea|D|Atalanta|5
Abildgaard|C|Verona|10
Adli|C|Milan|11
Adopo|C|Atalanta|7
Aebischer|C|Bologna|11
Agostinelli|C|Fiorentina|1
Agoume|C|Inter|5
Akpa Akpro|C|Lazio|11
Alessandro Cortinovis|C|Atalanta|1
Amrabat|C|Fiorentina|18
Anderson Lima|C|Lazio|1
Angelo Ghislandi|C|Atalanta|1
Aouar|C|Roma|27
Aramu|C|Genoa|17
Arthur|C|Fiorentina|13
Asllani|C|Inter|13
Badelj|C|Genoa|15
Bajrami|C|Sassuolo|26
Baldanzi|C|Empoli|25
Ballarini|C|Udinese|1
Barak|C|Fiorentina|24
Barella|C|Inter|38
Barrenechea|C|Frosinone|4
Basic|C|Lazio|14
Belardinelli|C|Empoli|2
Benassi|C|Fiorentina|9
Bennacer|C|Milan|25
Berisha M.|C|Lecce|1
Bertini|C|Lazio|1
Blin|C|Lecce|14
Bohinen|C|Salernitana|16
Boloca|C|Sassuolo|14
Bonaventura|C|Fiorentina|27
Bondo|C|Monza|8
Boultam|C|Salernitana|1
Bove|C|Roma|13
Brescianini|C|Frosinone|10
Cajuste|C|Napoli|10
Calhanoglu|C|Inter|36
Camara|C|Udinese|4
Cancellieri|C|Empoli|12
Candreva|C|Salernitana|33
Cassata|C|Genoa|8
Castrovilli|C|Fiorentina|20
Cataldi|C|Lazio|15
Caviglia|C|Juventus|11
Ceide|C|Sassuolo|8
Chiesa F.|C|Juventus|34
Chukwueze|C|Milan|31
Cisse A.|C|Verona|1
Ciurria|C|Monza|27
Colpani|C|Monza|18
Coulibaly L.|C|Salernitana|16
Coulibaly M.|C|Salernitana|14
Cristante|C|Roma|24
Crociata|C|Empoli|10
Da Riva|C|Atalanta|1
De Ketelaere|C|Atalanta|22
de Roon|C|Atalanta|22
Deiola|C|Cagliari|17
Demme|C|Napoli|11
Dominguez|C|Bologna|21
Duda|C|Verona|19
Duncan|C|Fiorentina|17
Ederson|C|Atalanta|20
El Azzouzi|C|Bologna|6
Elmas|C|Napoli|24
Emanuel Vignato|C|Bologna|13
Fabbian|C|Bologna|12
Fagioli|C|Juventus|23
Fazzini|C|Empoli|10
Felipe Anderson|C|Lazio|37
Ferguson|C|Bologna|31
Folorunsho|C|Verona|2
Frattesi|C|Inter|30
Frendrup|C|Genoa|19
Gaetano|C|Napoli|15
Gagliardini|C|Monza|14
Galdames|C|Genoa|8
Garritano|C|Frosinone|20
Gelli|C|Frosinone|1
Gineitis|C|Torino|4
Grassi|C|Empoli|13
Haas|C|Empoli|8
Haoudi|C|Frosinone|1
Harroui|C|Frosinone|11
Helgason|C|Lecce|7
Henderson|C|Empoli|13
Hongla|C|Verona|9
Hrustic|C|Verona|10
Iervolino|C|Salernitana|1
Ignacchiti|C|Empoli|1
Ilic|C|Torino|24
Iling-Junior|C|Juventus|5
Ilkhan|C|Torino|6
Ilsanker|C|Genoa|10
Infantino|C|Fiorentina|9
Jagiello|C|Genoa|16
Jankto|C|Cagliari|14
Joan Gonzalez|C|Lecce|13
Jony|C|Lazio|5
Joselito|C|Verona|1
Junior Messias|C|Genoa|23
Kaba|C|Lecce|11
Kaczmarski|C|Empoli|1
Kamada|C|Lazio|26
Kamensek Pahic|C|Frosinone|1
Kastanos|C|Salernitana|17
Koopmeiners|C|Atalanta|39
Kostic|C|Juventus|30
Kourfalidis|C|Cagliari|7
Kovalenko|C|Atalanta|11
Krunic|C|Milan|19
Lazovic|C|Verona|27
Legowski|C|Salernitana|5
Lella|C|Cagliari|4
Linetty|C|Torino|14
Lipani|C|Sassuolo|1
Listkowski|C|Lecce|7
Lobotka|C|Napoli|27
Locatelli|C|Juventus|25
Loftus-Cheek|C|Milan|26
Lombardi|C|Lazio|1
Lopez|C|Sassuolo|21
Lovric|C|Udinese|28
Luis Alberto|C|Lazio|40
Lulic|C|Frosinone|12
Maggiore|C|Salernitana|15
Makoumbou|C|Cagliari|15
Maleh|C|Lecce|9
Malinovskyi|C|Genoa|28
Mallamo|C|Atalanta|1
Mancosu|C|Cagliari|27
Mandragora|C|Fiorentina|21
Marcos Antônio|C|Lazio|13
Marin|C|Empoli|20
Matheus Henrique|C|Sassuolo|20
Mazzitelli|C|Frosinone|17
McKennie|C|Juventus|20
Melegoni|C|Genoa|1
Michael|C|Bologna|1
Miranchuk|C|Atalanta|27
Miretti|C|Juventus|13
Mkhitaryan|C|Inter|27
Moro N.|C|Bologna|16
Musah|C|Milan|17
Nandez|C|Cagliari|22
Oier Zarraga|C|Udinese|8
Oristanio|C|Cagliari|11
Pafundi|C|Udinese|4
Pagano|C|Roma|1
Paredes|C|Roma|20
Parigini|C|Genoa|1
Pasalic|C|Atalanta|28
Patane|C|Verona|1
Pedro Obiang|C|Sassuolo|8
Pejicic|C|Udinese|1
Pellegrini L.|C|Roma|35
Pepin|C|Monza|14
Pessina|C|Monza|28
Pisilli|C|Roma|1
Pobega|C|Milan|17
Pogba|C|Juventus|27
Prati|C|Cagliari|8
Quina|C|Udinese|7
Rabiot|C|Juventus|36
Racic|C|Sassuolo|14
Radonjic|C|Torino|23
Rafia|C|Lecce|10
Ramadani|C|Lecce|12
Ranocchia|C|Empoli|11
Reijnders|C|Milan|23
Renato Sanches|C|Roma|25
Renault|C|Atalanta|1
Ricci|C|Torino|22
Rog|C|Cagliari|10
Rovella|C|Lazio|20
Sabiri|C|Fiorentina|24
Saco|C|Napoli|1
Saelemaekers|C|Milan|20
Samardzic|C|Udinese|30
Saponara|C|Verona|20
Sensi|C|Inter|19
Sfait|C|Salernitana|1
Sidibe|C|Atalanta|1
Soule|C|Juventus|10
Strefezza|C|Lecce|30
Strootman|C|Genoa|14
Sulemana|C|Cagliari|4
Tameze|C|Torino|20
Thorsby|C|Genoa|11
Thorstvedt|C|Sassuolo|18
Urbanski|C|Bologna|1
Valoti|C|Monza|13
Vecino|C|Lazio|15
Vignato|C|Monza|14
Viola N.|C|Cagliari|10
Vlahovic V.|C|Atalanta|1
Vlasic|C|Torino|30
Volpato|C|Sassuolo|10
Walace|C|Udinese|15
Weah|C|Juventus|17
Zalewski|C|Roma|20
Zambo Anguissa|C|Napoli|28
Zedadka|C|Napoli|3
Zerbin|C|Napoli|14
Zielinski|C|Napoli|35
Žunec|C|Udinese|1
Traore|A|Milan|1
Abraham|A|Roma|38
Ake|A|Udinese|1
Almqvist|A|Lecce|6
Alvarez Martinez|A|Sassuolo|15
Antiste|A|Sassuolo|8
Arnautovic|A|Inter|31
Baez|A|Frosinone|8
Banda|A|Lecce|14
Barrow|A|Bologna|20
Belotti|A|Roma|16
Beltran|A|Fiorentina|24
Berardi D.|A|Sassuolo|40
Beto|A|Udinese|29
Bidaoui|A|Frosinone|10
Bonazzoli|A|Verona|15
Borrelli|A|Frosinone|7
Botheim|A|Salernitana|18
Braaf|A|Verona|8
Brekalo|A|Fiorentina|12
Brenner|A|Udinese|11
Burnete|A|Lecce|1
Cambiaghi|A|Atalanta|14
Caprari|A|Monza|23
Caputo|A|Empoli|24
Carboni V.|A|Monza|3
Caso|A|Frosinone|17
Castellanos|A|Lazio|20
Cazzadori|A|Verona|1
Cheddira|A|Frosinone|20
Cisse M.|A|Atalanta|1
Coda|A|Genoa|25
Colley|A|Atalanta|7
Colombo|A|Milan|14
Corfitzen|A|Lecce|1
Correa|A|Inter|17
Cuni|A|Frosinone|4
Dany Mota|A|Monza|19
Defrel|A|Sassuolo|12
Desogus|A|Cagliari|1
Di Francesco|A|Lecce|16
Dia|A|Salernitana|35
Djuric|A|Verona|14
Dybala|A|Roma|41
Ekong|A|Empoli|1
Ekuban|A|Genoa|10
El Shaarawy|A|Roma|23
Esposito|A|Inter|9
Falco|A|Cagliari|7
Gerard Deulofeu|A|Udinese|28
Giroud|A|Milan|33
Gonzalez N.|A|Fiorentina|24
Gonzalez D.|A|Lazio|2
Gori G.|A|Fiorentina|1
Gudmundsson|A|Genoa|18
Gyasi|A|Empoli|10
Henry|A|Verona|19
Ikone|A|Fiorentina|20
Immobile|A|Lazio|48
Insigne|A|Frosinone|19
Isaksen|A|Lazio|19
Jordi Mboula|A|Verona|9
Jovic|A|Fiorentina|22
Kaio Jorge|A|Juventus|2
Kallon|A|Verona|7
Karamoh|A|Torino|14
Kean|A|Juventus|16
Kokorin|A|Fiorentina|6
Kouame|A|Fiorentina|17
Kristoffersen|A|Salernitana|2
Krstovic|A|Lecce|9
Kvaratskhelia|A|Napoli|42
Kvernadze|A|Frosinone|8
Lapadula|A|Cagliari|26
Lauriente|A|Sassuolo|25
Lazetic|A|Milan|2
Lookman|A|Atalanta|30
Lozano|A|Napoli|23
Lucca|A|Udinese|10
Maldini|A|Empoli|9
Maric|A|Monza|4
Martinez L.|A|Inter|49
Mbala|A|Fiorentina|25
Milik|A|Juventus|24
Moro L.|A|Sassuolo|5
Mulattieri|A|Sassuolo|14
Munteanu|A|Fiorentina|1
Muriel|A|Atalanta|21
Ndoye|A|Bologna|13
Ngonge|A|Verona|18
Nwankwo|A|Salernitana|10
Okafor|A|Milan|22
Origi|A|Milan|15
Orlando|A|Salernitana|1
Orsolini|A|Bologna|25
Osimhen|A|Napoli|50
Pavoletti|A|Cagliari|10
Pedro|A|Lazio|22
Peli|A|Atalanta|1
Pellegri|A|Torino|13
Pellegrini J.|A|Sassuolo|1
Petagna|A|Monza|22
Piccoli|A|Empoli|13
Pinamonti|A|Sassuolo|19
Pjaca|A|Juventus|9
Politano|A|Napoli|19
Pulisic|A|Milan|26
Puscas|A|Genoa|10
Rafael Leao|A|Milan|42
Raspadori|A|Napoli|21
Raul Moro|A|Lazio|2
Ravaglioli|A|Bologna|1
Retegui|A|Genoa|30
Romero|A|Milan|8
Salcedo Mora|A|Inter|7
Sanabria|A|Torino|34
Scamacca|A|Atalanta|31
Seck|A|Torino|6
Shomurodov|A|Cagliari|14
Shpendi|A|Empoli|2
Simeone|A|Napoli|22
Siren Diao|A|Verona|1
Solbakken|A|Roma|12
Sottil|A|Fiorentina|10
Spalluto|A|Fiorentina|1
Stampete|A|Frosinone|1
Stewart|A|Salernitana|5
Success|A|Udinese|17
Thauvin|A|Udinese|15
Thuram|A|Inter|29
Toure|A|Atalanta|20
Valencia|A|Salernitana|9
van Hooijdonk|A|Bologna|5
Verdi|A|Torino|19
Vivaldo Semedo|A|Udinese|1
Vlahovic D.|A|Juventus|47
Voelkerling Persson|A|Lecce|1
Yalcin|A|Genoa|10
Yeboah|A|Genoa|8
Yildiz|A|Juventus|1
Zaccagni|A|Lazio|33
Zapata|A|Atalanta|33
Zirkzee|A|Bologna|14
Zito|A|Cagliari|18$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2023-24' and l.momento='partenza' and l.nome=p[1]);
