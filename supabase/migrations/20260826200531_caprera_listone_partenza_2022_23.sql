-- Listone di partenza 2022-23. Questo file e' l'unico dei sedici listoni dell'archivio
-- che arriva su una scala diversa: nell'originale Immobile sta a 92 e Vlahovic a 89,
-- mentre in ogni altra stagione il massimo sta fra 37 e 67. La Presidenza ha detto di
-- ridurlo, e i numeri le danno ragione: confrontando le quotazioni degli stessi
-- giocatori fra un file e l'altro, il rapporto 2023-24 su 2022-23 ha mediana 0,538 su
-- 306 giocatori, mentre 2023-24 su 2021-22 fa 1,12 - cioe' il salto c'e' solo in mezzo.
-- Applico il 55% indicato dalla Presidenza, che e' dentro il rumore dello 0,538 misurato.
-- Il massimo diventa 51, in fila con tutti gli altri.
insert into caprera.listone (stagione, nome, ruolo, club, prezzo, momento)
select '2022-23', p[1], p[2], p[3], p[4]::int, 'partenza'
  from (select string_to_array(r,'|') p
          from regexp_split_to_table($L$Adamonis|P|Lazio|1
Audero|P|Sampdoria|10
Bagnolini|P|Bologna|1
Bardi|P|Bologna|1
Berardi A.|P|Verona|1
Berisha|P|Torino|13
Bleve|P|Lecce|1
Boer|P|Roma|1
Brancolini|P|Lecce|1
Carnesecchi|P|Atalanta|1
Chiesa M.|P|Verona|1
Chiorra|P|Empoli|1
Ciezkowski|P|Cremonese|1
Consigli|P|Sassuolo|12
Contini Baranovsky|P|Sampdoria|1
Cordaz|P|Inter|1
Cragno|P|Monza|12
Di Gregorio|P|Monza|1
Dragowski|P|Spezia|1
Falcone|P|Lecce|1
Fiorillo|P|Salernitana|1
Gemello|P|Torino|1
Gollini|P|Fiorentina|15
Handanovic|P|Inter|22
Lamanna|P|Monza|1
Luis Maximiano|P|Lazio|18
Maignan|P|Milan|25
Marfella|P|Napoli|1
Meret|P|Napoli|20
Micai|P|Salernitana|1
Milinkovic-Savic V.|P|Torino|1
Mirante|P|Milan|1
Montipo|P|Verona|13
Musso|P|Atalanta|15
Onana|P|Inter|1
Padelli|P|Udinese|1
Pegolo|P|Sassuolo|1
Perilli|P|Verona|1
Perin|P|Juventus|1
Perisan|P|Empoli|1
Piana|P|Udinese|1
Pinsoglio|P|Juventus|1
Provedel|P|Lazio|11
Radu I.|P|Cremonese|9
Ravaglia|P|Sampdoria|1
Rosati|P|Fiorentina|1
Rossi|P|Atalanta|1
Rui Patricio|P|Roma|19
Russo|P|Sassuolo|1
Sarr|P|Cremonese|1
Sepe|P|Salernitana|10
Silvestri|P|Udinese|14
Sirigu|P|Napoli|1
Skorupski|P|Bologna|12
Sommariva|P|Monza|1
Sportiello|P|Atalanta|1
Svilar|P|Roma|1
Szczesny|P|Juventus|24
Tantalocchi|P|Sampdoria|1
Tatarusanu|P|Milan|1
Terracciano P.|P|Fiorentina|1
Vicario|P|Empoli|12
Zoet|P|Spezia|1
Zovko|P|Spezia|1
Acerbi|D|Lazio|14
Adjapong|D|Sassuolo|4
Aina|D|Torino|8
Alex Sandro|D|Juventus|13
Amey|D|Bologna|1
Amian Adou|D|Spezia|8
Amione|D|Verona|2
Anastasio|D|Monza|1
Antov|D|Monza|5
Aquino|D|Sampdoria|1
Augello|D|Sampdoria|10
Ayhan|D|Sassuolo|7
Ballo-Toure|D|Milan|4
Baschirotto|D|Lecce|6
Bastoni A.|D|Inter|19
Bastoni S.|D|Spezia|13
Bayeye|D|Torino|2
Bellanova|D|Inter|8
Benkovic|D|Udinese|3
Bereszynski|D|Sampdoria|9
Bertola|D|Spezia|1
Bettella|D|Monza|4
Bianchetti|D|Cremonese|7
Bijol|D|Udinese|8
Biraghi|D|Fiorentina|15
Birindelli|D|Monza|9
Bogdan|D|Salernitana|4
Bonifazi|D|Bologna|7
Bonucci|D|Juventus|19
Bradaric|D|Salernitana|9
Bremer|D|Juventus|21
Buongiorno|D|Torino|9
Cacace|D|Empoli|7
Calabria|D|Milan|18
Calafiori|D|Roma|4
Caldara|D|Spezia|6
Caldirola|D|Monza|8
Cambiaso|D|Bologna|8
Capradossi|D|Spezia|4
Carboni|D|Monza|8
Carlos|D|Monza|10
Casale|D|Lazio|10
Ceccherini|D|Verona|9
Celik|D|Roma|14
Cetin|D|Lecce|6
Chiriches|D|Cremonese|8
Colley|D|Sampdoria|10
Conti|D|Sampdoria|6
Coppola|D|Verona|2
Cuadrado|D|Juventus|21
Dalbert|D|Inter|4
D'Ambrosio|D|Inter|9
Danilo|D|Juventus|12
Darmian|D|Inter|13
Dawidowicz|D|Verona|7
De Sciglio|D|Juventus|8
De Silvestri|D|Bologna|10
de Vrij|D|Inter|16
De Winter|D|Empoli|1
Demiral|D|Atalanta|11
Depaoli|D|Sampdoria|4
Dermaku|D|Lecce|8
Di Lorenzo|D|Napoli|19
Dijks|D|Bologna|6
Dimarco|D|Inter|10
Djidji|D|Torino|9
Djimsiti|D|Atalanta|10
Dodô|D|Fiorentina|16
Doig|D|Verona|7
Donati|D|Monza|8
Dumfries|D|Inter|23
Ebosele|D|Udinese|8
Ebosse|D|Udinese|7
Ebuehi|D|Empoli|6
Erlic|D|Sassuolo|9
Farabegoli|D|Sampdoria|1
Faraoni|D|Verona|20
Fazio|D|Salernitana|9
Ferrari A.|D|Sampdoria|6
Ferrari G.|D|Sassuolo|11
Florenzi|D|Milan|10
Frabotta|D|Lecce|7
Gabbia|D|Milan|4
Gallo|D|Lecce|7
Gatti|D|Juventus|8
Gendrey|D|Lecce|7
Gentile|D|Fiorentina|1
Gosens|D|Inter|23
Gunter|D|Verona|8
Gyomber|D|Salernitana|7
Hateboer|D|Atalanta|9
Hernandez|D|Milan|24
Holm|D|Spezia|5
Hristov|D|Spezia|6
Hysaj|D|Lazio|8
Igor|D|Fiorentina|10
Ismajli|D|Empoli|6
Izzo|D|Torino|8
Jaroszynski|D|Salernitana|4
Juan Jesus|D|Napoli|7
Kalulu|D|Milan|15
Kamenovic|D|Lazio|3
Karsdorp|D|Roma|13
Kasius|D|Bologna|5
Kechrida|D|Salernitana|6
Kim Minjae|D|Napoli|13
Kiriakopoulos|D|Sassuolo|9
Kiwior|D|Spezia|7
Kjaer|D|Milan|13
Kumbulla|D|Roma|8
Lazaro|D|Torino|6
Lazzari|D|Lazio|14
Leonardo Buta|D|Udinese|6
Leverbe|D|Sampdoria|7
Lochoshvili|D|Cremonese|7
Lovato|D|Salernitana|8
Luperto|D|Empoli|6
Lykogiannis|D|Bologna|9
Maehle|D|Atalanta|13
Magnani|D|Verona|7
Mancini|D|Roma|16
Mantovani|D|Salernitana|3
Marchizza|D|Sassuolo|6
Mario Gila|D|Lazio|6
Mario Rui|D|Napoli|13
Marlon|D|Monza|10
Marrone|D|Monza|6
Martinez L.|D|Fiorentina|9
Marusic|D|Lazio|10
Masina|D|Udinese|7
Mazzocchi|D|Salernitana|8
Mbaye|D|Bologna|3
Medel|D|Bologna|9
Meroni|D|Sassuolo|1
Milenkovic|D|Fiorentina|14
Motoc|D|Salernitana|1
Muldur|D|Sassuolo|8
Murillo|D|Sampdoria|7
Murru|D|Sampdoria|5
Nastasic|D|Fiorentina|8
Ndiaye|D|Cremonese|1
Nikolaou|D|Spezia|8
Nuytinck|D|Udinese|10
Okoli|D|Atalanta|6
Olivera|D|Napoli|10
Østigård|D|Napoli|9
Pablo Mari|D|Monza|11
Paletta|D|Monza|4
Palomino|D|Atalanta|12
Paolo Ghiglione|D|Cremonese|10
Parisi|D|Empoli|9
Patric|D|Lazio|7
Pedro Pereira|D|Monza|9
Perez|D|Udinese|9
Pezzola|D|Empoli|1
Pirola|D|Salernitana|3
Pisacane|D|Lecce|1
Quagliata|D|Cremonese|7
Radovanovic|D|Salernitana|6
Radu S.|D|Lazio|6
Rafael Toloi|D|Atalanta|12
Ranocchia A.|D|Monza|9
Ravanelli|D|Cremonese|4
Reca|D|Spezia|9
Retsos|D|Verona|6
Rodrigo Becao|D|Udinese|12
Rodriguez|D|Torino|12
Roger Ibanez|D|Roma|15
Rogerio|D|Sassuolo|7
Romagna|D|Sassuolo|2
Romagnoli|D|Lazio|13
Rrahmani|D|Napoli|18
Ruan|D|Sassuolo|7
Ruegg|D|Verona|4
Rugani|D|Juventus|7
Ruggeri|D|Atalanta|4
Sala|D|Spezia|7
Salvador Ferrer|D|Spezia|6
Sambia|D|Salernitana|7
Sampirisi|D|Monza|8
Scalvini|D|Atalanta|7
Sernicola|D|Cremonese|8
Serpe|D|Spezia|2
Singo|D|Torino|17
Skriniar|D|Inter|21
Smalling|D|Roma|20
Soppy|D|Udinese|7
Soumaoro|D|Bologna|9
Spinazzola|D|Roma|18
Stanga|D|Milan|6
Stojanovic|D|Empoli|9
Terzic|D|Fiorentina|6
Toljan|D|Sassuolo|7
Tomori|D|Milan|19
Tonelli|D|Empoli|7
Tuia|D|Lecce|6
Udogie|D|Udinese|20
Valeri|D|Cremonese|9
Vasquez|D|Cremonese|8
Venuti|D|Fiorentina|8
Veseli|D|Salernitana|6
Vignali|D|Spezia|4
Vina|D|Roma|8
Vojvoda|D|Torino|13
Zanoli|D|Napoli|6
Zappacosta|D|Atalanta|13
Zima|D|Torino|7
Zortea|D|Atalanta|5
Acella|C|Cremonese|1
Adli|C|Milan|13
Adopo|C|Torino|2
Aebischer|C|Bologna|9
Agoume|C|Inter|4
Agudelo|C|Spezia|15
Ake|C|Juventus|3
Akpa Akpro|C|Lazio|6
Alessandro Cortinovis|C|Verona|3
Amrabat|C|Fiorentina|14
Arslan|C|Udinese|9
Arthur|C|Juventus|12
Ascacibar|C|Cremonese|9
Askildsen|C|Lecce|4
Asllani|C|Inter|12
Baez|C|Cremonese|14
Bajrami|C|Empoli|15
Bakayoko|C|Milan|7
Baldanzi|C|Empoli|1
Ballarini|C|Udinese|1
Bandinelli|C|Empoli|13
Barak|C|Verona|30
Barberis|C|Monza|10
Barella|C|Inter|25
Bartolomei|C|Cremonese|5
Basic|C|Lazio|12
Benassi|C|Fiorentina|7
Bennacer|C|Milan|16
Bianco|C|Fiorentina|1
Bistrovic|C|Lecce|8
Bjorkengren|C|Lecce|6
Blin|C|Lecce|9
Bohinen|C|Salernitana|12
Bonaventura|C|Fiorentina|19
Bondo|C|Monza|4
Boultam|C|Salernitana|2
Bourabia|C|Spezia|7
Bove|C|Roma|4
Brahim Diaz|C|Milan|14
Brozovic|C|Inter|23
Calhanoglu|C|Inter|26
Cambiaghi|C|Empoli|8
Cancellieri|C|Lazio|9
Candreva|C|Salernitana|24
Capezzi|C|Salernitana|4
Casadei|C|Inter|1
Castagnetti|C|Cremonese|8
Castrovilli|C|Fiorentina|16
Cataldi|C|Lazio|11
Cavion|C|Salernitana|4
Ceide|C|Sassuolo|6
Chiesa F.|C|Juventus|27
Ciurria|C|Monza|9
Colpani|C|Monza|8
Cortinovis|C|Inter|3
Coulibaly|C|Salernitana|9
Cristante|C|Roma|16
Crociata|C|Empoli|4
D'Alessandro|C|Monza|12
Darboe|C|Roma|3
De Ketelaere|C|Milan|31
de Roon|C|Atalanta|16
Demme|C|Napoli|9
di Maria|C|Juventus|30
Di Mariano|C|Lecce|13
Djuricic|C|Sampdoria|19
Dominguez|C|Bologna|12
Duncan|C|Fiorentina|15
Ederson|C|Atalanta|16
Ekdal|C|Spezia|9
Ellertsson|C|Spezia|2
Elmas|C|Napoli|18
Emanuel Vignato|C|Bologna|10
Escalante|C|Cremonese|10
Fabian Ruiz|C|Napoli|26
Fagioli|C|Juventus|8
Felipe Anderson|C|Lazio|21
Ferguson|C|Bologna|8
Frattesi|C|Sassuolo|19
Gaetano|C|Napoli|12
Gagliardini|C|Inter|9
Gerard Yepes|C|Sampdoria|1
Gonzalo Villar|C|Sampdoria|9
Haas|C|Empoli|9
Harroui|C|Sassuolo|6
Helgason|C|Lecce|8
Henderson|C|Empoli|12
Hjulmand|C|Lecce|11
Hongla|C|Verona|7
Ilic|C|Verona|15
Ilkhan|C|Torino|6
Jajalo|C|Udinese|6
Jerdy Schouten|C|Bologna|13
Junior Messias|C|Milan|16
Kastanos|C|Salernitana|9
Koopmeiners|C|Atalanta|18
Kornvig|C|Spezia|6
Kostic|C|Juventus|23
Kovalenko|C|Spezia|9
Krunic|C|Milan|12
Kryeziu|C|Torino|1
Lazovic|C|Verona|18
Leris|C|Sampdoria|6
Linetty|C|Torino|10
Listkowski|C|Lecce|8
Lobotka|C|Napoli|14
Locatelli|C|Juventus|18
Lopez|C|Sassuolo|16
Lovric|C|Udinese|9
Luis Alberto|C|Lazio|29
Lukic|C|Torino|20
Maggiore|C|Spezia|15
Makengo|C|Udinese|13
Maldini|C|Spezia|5
Maleh|C|Fiorentina|11
Mandragora|C|Fiorentina|13
Marcos Antônio|C|Lazio|14
Marin|C|Empoli|13
Matheus Henrique|C|Sassuolo|10
Matic|C|Roma|14
Mazzitelli|C|Monza|9
McKennie|C|Juventus|15
Miguel Veloso|C|Verona|11
Milanese|C|Cremonese|9
Milinkovic-Savic S.|C|Lazio|34
Miretti|C|Juventus|9
Mkhitaryan|C|Inter|20
Molina|C|Monza|7
Morosini|C|Monza|3
Nardi|C|Cremonese|3
Nguiamba|C|Spezia|1
Pafundi|C|Udinese|1
Palumbo|C|Udinese|1
Pasalic|C|Atalanta|28
Pedro Obiang|C|Sassuolo|6
Pellegrini|C|Roma|31
Pepin|C|Monza|12
Pereyra|C|Udinese|19
Pessina|C|Monza|16
Pickel|C|Cremonese|8
Pobega|C|Milan|14
Podgoreanu|C|Spezia|4
Pogba|C|Juventus|29
Politic|C|Cremonese|1
Praszelik|C|Verona|6
Pulgar|C|Fiorentina|7
Rabiot|C|Juventus|14
Radonjic|C|Torino|16
Ranocchia F.|C|Monza|4
Ricci|C|Torino|13
Rigoni|C|Monza|4
Rincon|C|Sampdoria|10
Romero|C|Lazio|3
Ronaldo Vieira|C|Sampdoria|4
Rovella|C|Juventus|9
Sabiri|C|Sampdoria|20
Saelemaekers|C|Milan|14
Samardzic|C|Udinese|13
Samek|C|Lecce|6
Samu Castillejo|C|Milan|6
Saponara|C|Fiorentina|15
Scozzarella|C|Monza|7
Segre|C|Torino|7
Sensi|C|Monza|15
Sher|C|Spezia|2
Siatounis|C|Monza|1
Soriano|C|Bologna|16
Soule|C|Juventus|2
Strefezza|C|Lecce|20
Stulac|C|Empoli|11
Tameze|C|Verona|16
Tenkorang|C|Cremonese|1
Terracciano F.|C|Verona|1
Thorstvedt|C|Sassuolo|15
Tonali|C|Milan|24
Traore|C|Sassuolo|23
Trimboli|C|Sampdoria|1
Urbanski|C|Bologna|1
Valoti|C|Monza|16
Valzania|C|Cremonese|8
Vecino|C|Lazio|12
Verre|C|Sampdoria|9
Vignato|C|Monza|4
Vilhena|C|Salernitana|13
Walace|C|Udinese|10
Wijnaldum|C|Roma|19
Zaccagni|C|Lazio|23
Zakaria|C|Juventus|15
Zalewski|C|Roma|14
Zambo Anguissa|C|Napoli|15
Zanimacchia|C|Cremonese|15
Zaniolo|C|Roma|25
Zerbin|C|Napoli|11
Zielinski|C|Napoli|27
Zurkowski|C|Fiorentina|20
Abraham|A|Roma|41
Afena-Gyan|A|Roma|14
Antiste|A|Spezia|11
Arnautovic|A|Bologna|32
Arthur Cabral|A|Fiorentina|23
Banda|A|Lecce|11
Barrow|A|Bologna|21
Berardi D.|A|Sassuolo|41
Beto|A|Udinese|29
Boga|A|Atalanta|19
Bonazzoli|A|Salernitana|21
Botheim|A|Salernitana|20
Buonaiuto|A|Cremonese|13
Caprari|A|Monza|30
Caputo|A|Sampdoria|25
Ceesay|A|Lecce|20
Ciofani|A|Cremonese|15
Colombo|A|Lecce|13
Correa|A|Inter|18
Da Graca|A|Juventus|1
Dany Mota|A|Monza|17
De Luca|A|Sampdoria|9
Defrel|A|Sassuolo|12
Dessers|A|Cremonese|20
Destro|A|Empoli|24
Di Carmine|A|Cremonese|10
Di Francesco|A|Lecce|16
Djuric|A|Verona|16
Dybala|A|Roma|34
Dzeko|A|Inter|23
Edera|A|Torino|6
Edoardo Vergani|A|Salernitana|2
Ekong|A|Empoli|1
El Shaarawy|A|Roma|14
Gabbiadini|A|Sampdoria|20
Gerard Deulofeu|A|Udinese|29
Giroud|A|Milan|32
Gonzalez|A|Fiorentina|26
Gyasi|A|Spezia|17
Gytkjaer|A|Monza|13
Henry|A|Verona|21
Horvath|A|Torino|1
Ibrahimovic|A|Milan|22
Ikone|A|Fiorentina|17
Ilicic|A|Atalanta|15
Immobile|A|Lazio|51
Jovic|A|Fiorentina|30
Juwara|A|Bologna|3
Kaio Jorge|A|Juventus|7
Kean|A|Juventus|16
Kluivert|A|Roma|13
Kokorin|A|Fiorentina|8
Kouame|A|Fiorentina|13
Kristoffersen|A|Salernitana|1
Kvaratskhelia|A|Napoli|24
Lammers|A|Empoli|10
Lasagna|A|Verona|14
Lazetic|A|Milan|3
Lookman|A|Atalanta|18
Lozano|A|Napoli|20
Lukaku|A|Inter|47
Malinovskyi|A|Atalanta|25
Maric|A|Monza|11
Martinez L.|A|Inter|44
Mbala|A|Spezia|13
Millico|A|Torino|6
Miranchuk|A|Torino|13
Muriel|A|Atalanta|35
Nestorovski|A|Udinese|12
Nwankwo|A|Salernitana|14
Oddei|A|Sassuolo|3
Okereke|A|Cremonese|13
Origi|A|Milan|28
Orsolini|A|Bologna|21
Osimhen|A|Napoli|42
Ounas|A|Napoli|9
Pablo Rodriguez|A|Lecce|9
Pagliuca|A|Bologna|1
Pedro|A|Lazio|23
Pellegri|A|Torino|14
Petagna|A|Monza|14
Piccoli|A|Verona|12
Pinamonti|A|Sassuolo|19
Pjaca|A|Juventus|10
Politano|A|Napoli|17
Quagliarella|A|Sampdoria|18
Rafael Leao|A|Milan|38
Raimondo|A|Bologna|1
Raspadori|A|Sassuolo|27
Raul Moro|A|Lazio|4
Rebic|A|Milan|17
Ribery|A|Salernitana|15
Sanabria|A|Torino|20
Sansone|A|Bologna|12
Satriano|A|Empoli|15
Seck|A|Torino|8
Shomurodov|A|Roma|15
Simeone|A|Verona|32
Sottil|A|Fiorentina|13
Strelec|A|Spezia|9
Strizzolo|A|Cremonese|9
Success|A|Udinese|15
Tsadjout|A|Cremonese|6
Valencia|A|Salernitana|14
Verde|A|Spezia|21
Verdi|A|Torino|18
Vlahovic|A|Juventus|49
Vlasic|A|Torino|19
Voelkerling Persson|A|Lecce|1
Zapata|A|Atalanta|39
Zaza|A|Torino|12$L$, E'\n') r) x
 where not exists (select 1 from caprera.listone l
                    where l.stagione='2022-23' and l.momento='partenza' and l.nome=p[1]);
