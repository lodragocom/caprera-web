-- La rosa di settembre del 2020-21, con i prezzi, dal file RoseLegaFantapazz.
-- Avevo scritto che quell'asta non aveva lasciato un foglio. Sbagliato: il foglio
-- e' l'export di Fantapazz, dove la quotazione E' quanto e' stato pagato.
-- La metto prima in lavoro, perche' voglio confrontarla con la rosa che avevo
-- ricostruito dal campo un'ora fa. Un metodo si giudica quando arriva la verita'.
create schema if not exists lavoro;
drop table if exists lavoro.rose_fantapazz;
create table lavoro.rose_fantapazz (stagione text, societa text, ruolo text, nome text, costo int, club text);
insert into lavoro.rose_fantapazz
select p[1], p[2], p[3], p[4], p[5]::int, p[6]
  from (select string_to_array(r,'|') p from regexp_split_to_table($R$2020-21|prosecco|P|Cordaz|1|CRO
2020-21|prosecco|P|Crespi|1|CRO
2020-21|prosecco|P|Festa|1|CRO
2020-21|prosecco|P|Handanovic|1|INT
2020-21|prosecco|P|Padelli|1|INT
2020-21|prosecco|P|Radu A.|1|INT
2020-21|prosecco|D|Hakimi|40|INT
2020-21|prosecco|D|Bastoni|8|INT
2020-21|prosecco|D|Darmian|4|INT
2020-21|prosecco|D|Musacchio|2|LAZ
2020-21|prosecco|D|Ansaldi|1|TOR
2020-21|prosecco|D|Bonifazi|1|UDI
2020-21|prosecco|D|Koulibaly|1|NAP
2020-21|prosecco|D|Reynolds|1|ROM
2020-21|prosecco|C|Kulusevski|32|JUV
2020-21|prosecco|C|Barella|1|INT
2020-21|prosecco|C|Brozovic|1|INT
2020-21|prosecco|C|Demme|1|NAP
2020-21|prosecco|C|Eriksen|1|INT
2020-21|prosecco|C|Locatelli|1|SAS
2020-21|prosecco|C|Milinkovic S.|1|LAZ
2020-21|prosecco|C|Sensi|1|INT
2020-21|prosecco|A|Zapata D.|78|ATA
2020-21|prosecco|A|Morata|22|JUV
2020-21|prosecco|A|Llorente|9|UDI
2020-21|prosecco|A|Caicedo|1|LAZ
2020-21|prosecco|A|Kokorin|1|FIO
2020-21|prosecco|A|Raspadori|1|SAS
2020-21|prosecco|A|Sanchez|1|INT
2020-21|prosecco|A|Zirkzee|1|PAR
2020-21|smit|P|Consigli|12|SAS
2020-21|smit|P|Pau Lopez|12|ROM
2020-21|smit|P|Fuzato|1|ROM
2020-21|smit|P|Mirante|1|ROM
2020-21|smit|P|Pegolo|1|SAS
2020-21|smit|P|Turati|1|SAS
2020-21|smit|D|Hateboer|21|ATA
2020-21|smit|D|Faraoni|10|VER
2020-21|smit|D|Zappacosta|4|GEN
2020-21|smit|D|Biraghi|1|FIO
2020-21|smit|D|Bruno Peres|1|ROM
2020-21|smit|D|Conti|1|PAR
2020-21|smit|D|D'Ambrosio|1|INT
2020-21|smit|D|Karsdorp|1|ROM
2020-21|smit|C|Mkhitaryan|20|ROM
2020-21|smit|C|Thorsby|2|SAM
2020-21|smit|C|Agoume|1|SPE
2020-21|smit|C|Castrovilli|1|FIO
2020-21|smit|C|Kovalenko|1|ATA
2020-21|smit|C|Pobega|1|SPE
2020-21|smit|C|Rovella|1|GEN
2020-21|smit|C|Saelemaekers|1|MIL
2020-21|smit|C|Schiattarella|1|BEN
2020-21|smit|C|Zaniolo|1|ROM
2020-21|smit|A|Immobile|78|LAZ
2020-21|smit|A|Pedro|21|ROM
2020-21|smit|A|Mayoral|9|ROM
2020-21|smit|A|Orsolini|8|BOL
2020-21|smit|A|Keita|3|SAM
2020-21|smit|A|El Shaarawy|1|ROM
2020-21|real-monghi|P|Gori|1|BEN
2020-21|real-monghi|P|Lucatelli|1|BEN
2020-21|real-monghi|P|Montipo|1|BEN
2020-21|real-monghi|P|Provedel|1|SPE
2020-21|real-monghi|P|Rafael D.A.|1|SPE
2020-21|real-monghi|P|Zoet|1|SPE
2020-21|real-monghi|D|Spinazzola|15|ROM
2020-21|real-monghi|D|Gagliolo|4|PAR
2020-21|real-monghi|D|Bastoni S.|2|SPE
2020-21|real-monghi|D|Augello|1|SAM
2020-21|real-monghi|D|Dawidowicz|1|VER
2020-21|real-monghi|D|Kjaer|1|MIL
2020-21|real-monghi|D|Lykogiannis|1|CAG
2020-21|real-monghi|D|Tripaldelli|1|CAG
2020-21|real-monghi|C|Calhanoglu|27|MIL
2020-21|real-monghi|C|Strootman|9|GEN
2020-21|real-monghi|C|Meite|5|MIL
2020-21|real-monghi|C|Askildsen|1|SAM
2020-21|real-monghi|C|Damsgaard|1|SAM
2020-21|real-monghi|C|Hernani|1|PAR
2020-21|real-monghi|C|Ilic|1|VER
2020-21|real-monghi|C|Obiang|1|SAS
2020-21|real-monghi|C|Veloso|1|VER
2020-21|real-monghi|C|Zielinski|1|NAP
2020-21|real-monghi|A|Caputo|62|SAS
2020-21|real-monghi|A|Nzola|15|SPE
2020-21|real-monghi|A|Leao|12|MIL
2020-21|real-monghi|A|Caprari|2|BEN
2020-21|real-monghi|A|Galabinov|1|SPE
2020-21|real-monghi|A|Insigne L.|1|NAP
2020-21|sporting-mangiapreti|P|Strakosha|21|LAZ
2020-21|sporting-mangiapreti|P|Gollini|12|ATA
2020-21|sporting-mangiapreti|P|Alia|1|LAZ
2020-21|sporting-mangiapreti|P|Reina|1|LAZ
2020-21|sporting-mangiapreti|P|Rossi Fr.|1|ATA
2020-21|sporting-mangiapreti|P|Sportiello|1|ATA
2020-21|sporting-mangiapreti|D|Gosens|27|ATA
2020-21|sporting-mangiapreti|D|Milenkovic|16|FIO
2020-21|sporting-mangiapreti|D|Di Lorenzo|10|NAP
2020-21|sporting-mangiapreti|D|Lulic|2|LAZ
2020-21|sporting-mangiapreti|D|Djimsiti|1|ATA
2020-21|sporting-mangiapreti|D|Ghiglione|1|GEN
2020-21|sporting-mangiapreti|D|Palomino|1|ATA
2020-21|sporting-mangiapreti|D|Zappa|1|CAG
2020-21|sporting-mangiapreti|C|Chiesa|30|JUV
2020-21|sporting-mangiapreti|C|Villar|17|ROM
2020-21|sporting-mangiapreti|C|De Paul|10|UDI
2020-21|sporting-mangiapreti|C|Soriano|7|BOL
2020-21|sporting-mangiapreti|C|Pulgar|5|FIO
2020-21|sporting-mangiapreti|C|Maggiore|1|SPE
2020-21|sporting-mangiapreti|C|Traore H.|1|SAS
2020-21|sporting-mangiapreti|C|Viola|1|BEN
2020-21|sporting-mangiapreti|C|Zajc|1|GEN
2020-21|sporting-mangiapreti|A|Mertens|40|NAP
2020-21|sporting-mangiapreti|A|Destro|16|GEN
2020-21|sporting-mangiapreti|A|Lozano|15|NAP
2020-21|sporting-mangiapreti|A|Cornelius|1|PAR
2020-21|sporting-mangiapreti|A|Inglese|1|PAR
2020-21|sporting-mangiapreti|A|Lasagna|1|VER
2020-21|sporting-mangiapreti|A|Salcedo|1|VER
2020-21|sanguemisto|P|Audero|1|SAM
2020-21|sanguemisto|P|Letica|1|SAM
2020-21|sanguemisto|P|Milinkovic V.|1|TOR
2020-21|sanguemisto|P|Ravaglia N.|1|SAM
2020-21|sanguemisto|P|Rosati|1|FIO
2020-21|sanguemisto|P|Sirigu|1|TOR
2020-21|sanguemisto|D|Young|5|INT
2020-21|sanguemisto|D|Colley O.|1|SAM
2020-21|sanguemisto|D|Danilo La.|1|BOL
2020-21|sanguemisto|D|Foulon|1|BEN
2020-21|sanguemisto|D|Hickey|1|BOL
2020-21|sanguemisto|D|Iacoponi|1|PAR
2020-21|sanguemisto|D|Izzo|1|TOR
2020-21|sanguemisto|D|Marusic|1|LAZ
2020-21|sanguemisto|D|Molina S.|1|CRO
2020-21|sanguemisto|D|Rocha|1|SAM
2020-21|sanguemisto|C|Candreva|25|SAM
2020-21|sanguemisto|C|Veretout|19|ROM
2020-21|sanguemisto|C|Djuricic|12|SAS
2020-21|sanguemisto|C|Freuler|6|ATA
2020-21|sanguemisto|C|Linetty|2|TOR
2020-21|sanguemisto|C|Perisic|2|INT
2020-21|sanguemisto|C|Barak|1|VER
2020-21|sanguemisto|C|Diaz|1|MIL
2020-21|sanguemisto|A|Ronaldo C.|130|JUV
2020-21|sanguemisto|A|Correa|21|LAZ
2020-21|sanguemisto|A|Dzeko|1|ROM
2020-21|sanguemisto|A|Mandzukic|1|MIL
2020-21|sanguemisto|A|Muriqi|1|LAZ
2020-21|sanguemisto|A|Quagliarella|1|SAM
2020-21|armata-rossa|P|Ospina|25|NAP
2020-21|armata-rossa|P|Perin|4|GEN
2020-21|armata-rossa|P|Contini|1|NAP
2020-21|armata-rossa|P|Marchetti|1|GEN
2020-21|armata-rossa|P|Meret|1|NAP
2020-21|armata-rossa|P|Paleari|1|GEN
2020-21|armata-rossa|D|Hernandez|26|MIL
2020-21|armata-rossa|D|Tomiyasu|7|BOL
2020-21|armata-rossa|D|Hysaj|4|NAP
2020-21|armata-rossa|D|Mario Rui|4|NAP
2020-21|armata-rossa|D|Nuytinck|4|UDI
2020-21|armata-rossa|D|Armini|1|LAZ
2020-21|armata-rossa|D|Caceres|1|FIO
2020-21|armata-rossa|D|Kyriakopoulos|1|SAS
2020-21|armata-rossa|D|Toloi|1|ATA
2020-21|armata-rossa|C|Malinovskyi|19|ATA
2020-21|armata-rossa|C|Lazzari|4|LAZ
2020-21|armata-rossa|C|Tonali|4|MIL
2020-21|armata-rossa|C|Bennacer|2|MIL
2020-21|armata-rossa|C|Verre|2|SAM
2020-21|armata-rossa|C|Ionita|1|BEN
2020-21|armata-rossa|C|Portanova|1|GEN
2020-21|armata-rossa|C|Tameze|1|VER
2020-21|armata-rossa|C|Vidal|1|INT
2020-21|armata-rossa|A|Lukaku R.|108|INT
2020-21|armata-rossa|A|Gervinho|11|PAR
2020-21|armata-rossa|A|Deulofeu|5|UDI
2020-21|armata-rossa|A|Di Carmine|1|CRO
2020-21|armata-rossa|A|Iago Falque|1|BEN
2020-21|armata-rossa|A|Shomurodov|1|GEN
2020-21|subbuteo|P|Musso|7|UDI
2020-21|subbuteo|P|Sepe|6|PAR
2020-21|subbuteo|P|Colombi|1|PAR
2020-21|subbuteo|P|Gasparini|1|UDI
2020-21|subbuteo|P|Rinaldi|1|PAR
2020-21|subbuteo|P|Scuffet|1|UDI
2020-21|subbuteo|D|Bonucci|20|JUV
2020-21|subbuteo|D|Criscito|11|GEN
2020-21|subbuteo|D|Letizia|5|BEN
2020-21|subbuteo|D|Glik|3|BEN
2020-21|subbuteo|D|Acerbi|1|LAZ
2020-21|subbuteo|D|Bruno Alves|1|PAR
2020-21|subbuteo|D|Dimarco|1|VER
2020-21|subbuteo|D|Martinez Lu.|1|FIO
2020-21|subbuteo|D|Sutalo|1|ATA
2020-21|subbuteo|C|Luis Alberto|36|LAZ
2020-21|subbuteo|C|Kessie|6|MIL
2020-21|subbuteo|C|Nainggolan|4|CAG
2020-21|subbuteo|C|Bonaventura|1|FIO
2020-21|subbuteo|C|Jankto|1|SAM
2020-21|subbuteo|C|Lazovic|1|VER
2020-21|subbuteo|C|Ramirez|1|SAM
2020-21|subbuteo|C|Ruiz|1|NAP
2020-21|subbuteo|A|Dybala|65|JUV
2020-21|subbuteo|A|Berardi D.|50|SAS
2020-21|subbuteo|A|Ilicic|10|ATA
2020-21|subbuteo|A|Simy|9|CRO
2020-21|subbuteo|A|Vignato|4|BOL
2020-21|subbuteo|A|Boga|1|SAS
2020-21|subbuteo|A|Man|1|PAR
2020-21|aston-ville|P|Silvestri|8|VER
2020-21|aston-ville|P|Cragno|5|CAG
2020-21|aston-ville|P|Aresti|1|CAG
2020-21|aston-ville|P|Berardi A.|1|VER
2020-21|aston-ville|P|Pandur|1|VER
2020-21|aston-ville|P|Vicario|1|CAG
2020-21|aston-ville|D|Ibanez|8|ROM
2020-21|aston-ville|D|Mancini G.|8|ROM
2020-21|aston-ville|D|Calabria|5|MIL
2020-21|aston-ville|D|Ferrari G.|5|SAS
2020-21|aston-ville|D|Caldirola|3|BEN
2020-21|aston-ville|D|Romero C.|3|ATA
2020-21|aston-ville|D|Lovato|1|VER
2020-21|aston-ville|D|Osorio|1|PAR
2020-21|aston-ville|D|Yoshida|1|SAM
2020-21|aston-ville|C|Amrabat|7|FIO
2020-21|aston-ville|C|Arthur|3|JUV
2020-21|aston-ville|C|Kucka|3|PAR
2020-21|aston-ville|C|De Roon|1|ATA
2020-21|aston-ville|C|Kurtic|1|PAR
2020-21|aston-ville|C|Nandez|1|CAG
2020-21|aston-ville|C|Nicolussi|1|PAR
2020-21|aston-ville|C|Pellegrini Lo.|1|ROM
2020-21|aston-ville|C|Pereyra|1|UDI
2020-21|aston-ville|A|Belotti|79|TOR
2020-21|aston-ville|A|Muriel|52|ATA
2020-21|aston-ville|A|Ribery|34|FIO
2020-21|aston-ville|A|Messias|8|CRO
2020-21|aston-ville|A|Kalinic|1|VER
2020-21|aston-ville|A|Lapadula|1|BEN
2020-21|roburro|P|Donnarumma G.|24|MIL
2020-21|roburro|P|Brancolini|1|FIO
2020-21|roburro|P|Donnarumma Ant.|1|MIL
2020-21|roburro|P|Dragowski|1|FIO
2020-21|roburro|P|Tatarusanu|1|MIL
2020-21|roburro|P|Terracciano|1|FIO
2020-21|roburro|D|Smalling|20|ROM
2020-21|roburro|D|De Vrij|15|INT
2020-21|roburro|D|Skriniar|4|INT
2020-21|roburro|D|Pezzella Ge.|3|FIO
2020-21|roburro|D|Kalulu|1|MIL
2020-21|roburro|D|Manolas|1|NAP
2020-21|roburro|D|Pellegrini Lu.|1|GEN
2020-21|roburro|D|Romagnoli A.|1|MIL
2020-21|roburro|D|Samir|1|UDI
2020-21|roburro|D|Singo|1|TOR
2020-21|roburro|C|Miranchuk|9|ATA
2020-21|roburro|C|Bentancur|6|JUV
2020-21|roburro|C|Zaccagni|2|VER
2020-21|roburro|C|Bakayoko|1|NAP
2020-21|roburro|C|Callejon|1|FIO
2020-21|roburro|C|Ekdal|1|SAM
2020-21|roburro|C|Marin|1|CAG
2020-21|roburro|C|Pessina|1|ATA
2020-21|roburro|A|Osimhen|54|NAP
2020-21|roburro|A|Rebic|23|MIL
2020-21|roburro|A|Joao Pedro|20|CAG
2020-21|roburro|A|Simeone|20|CAG
2020-21|roburro|A|Vlahovic|7|FIO
2020-21|roburro|A|Pavoletti|1|CAG
2020-21|disperata|P|Buffon|1|JUV
2020-21|disperata|P|Da Costa|1|BOL
2020-21|disperata|P|Pinsoglio|1|JUV
2020-21|disperata|P|Ravaglia F.|1|BOL
2020-21|disperata|P|Skorupski|1|BOL
2020-21|disperata|P|Szczesny|1|JUV
2020-21|disperata|D|De Ligt|18|JUV
2020-21|disperata|D|Godin|11|CAG
2020-21|disperata|D|Demiral|2|JUV
2020-21|disperata|D|Alex Sandro|1|JUV
2020-21|disperata|D|Chiellini|1|JUV
2020-21|disperata|D|Danilo Luiz|1|JUV
2020-21|disperata|D|Kumbulla|1|ROM
2020-21|disperata|D|Pedro Pereira|1|CRO
2020-21|disperata|D|Rugani|1|CAG
2020-21|disperata|C|Pasalic|18|ATA
2020-21|disperata|C|Ramsey|10|JUV
2020-21|disperata|C|Bernardeschi|1|JUV
2020-21|disperata|C|Cuadrado|1|JUV
2020-21|disperata|C|Mandragora|1|TOR
2020-21|disperata|C|McKennie|1|JUV
2020-21|disperata|C|Rabiot|1|JUV
2020-21|disperata|C|Rincon|1|TOR
2020-21|disperata|A|Martinez L.|93|INT
2020-21|disperata|A|Ibrahimovic|76|MIL
2020-21|disperata|A|Barrow|1|BOL
2020-21|disperata|A|Okaka|1|UDI
2020-21|disperata|A|Pjaca|1|GEN
2020-21|disperata|A|Zaza|1|TOR$R$, E'\n') r) x;
revoke all on lavoro.rose_fantapazz from anon, authenticated;
