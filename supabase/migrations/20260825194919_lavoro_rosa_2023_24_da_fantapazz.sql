-- Area di lavoro, non archivio. Qui dentro sta la rosa 2023-24 come l'ha data
-- Fantapazz (file consegnato dalla Presidenza), per confrontarla col campo prima
-- di decidere se e come sostituire le 310 righe finte che oggi stanno in
-- caprera.rose con l'etichetta 2023-24.
create schema if not exists lavoro;
revoke all on schema lavoro from anon, authenticated;

drop table if exists lavoro.rosa_2023_24;
create table lavoro.rosa_2023_24 (
  societa text not null,
  ruolo   char not null,
  nome    text not null,
  costo   int  not null,
  club    text not null,
  calciatore int
);

insert into lavoro.rosa_2023_24 (societa, ruolo, nome, costo, club)
select v[1], v[2], v[3], v[4]::int, v[5]
from (select string_to_array(r,'|') v
      from regexp_split_to_table($X$
smit|P|Carnesecchi|3|ATA
smit|P|Di Gregorio|1|MON
smit|P|Gori|1|MON
smit|P|Musso|1|ATA
smit|P|Rossi Fr.|1|ATA
smit|P|Sorrentino|1|MON
smit|D|Bellanova|13|TOR
smit|D|Scalvini|5|ATA
smit|D|Hateboer|3|ATA
smit|D|Acerbi|1|INT
smit|D|Angelino|1|ROM
smit|D|Coppola|1|VER
smit|D|Faraoni|1|FIO
smit|D|Kayode|1|FIO
smit|D|Zappa|1|CAG
smit|C|Bonaventura|21|FIO
smit|C|Politano|21|NAP
smit|C|Koopmeiners|17|ATA
smit|C|Zielinski|13|NAP
smit|C|Ferguson|7|BOL
smit|C|Bove|1|ROM
smit|C|El Shaarawy|1|ROM
smit|C|Lovric|1|UDI
smit|C|Orsolini|1|BOL
smit|A|Scamacca|108|ATA
smit|A|Deulofeu|16|UDI
smit|A|Abraham|8|ROM
smit|A|Colombo|1|MON
smit|A|Lookman|1|ATA
smit|A|Niang|1|EMP
smit|A|Swiderski|1|VER
armata-rossa|P|Meret|13|NAP
armata-rossa|P|Bagnolini|1|BOL
armata-rossa|P|Contini|1|NAP
armata-rossa|P|Gollini|1|NAP
armata-rossa|P|Ravaglia F.|1|BOL
armata-rossa|P|Skorupski|1|BOL
armata-rossa|D|Hernandez|9|MIL
armata-rossa|D|Marusic|7|LAZ
armata-rossa|D|Darmian|6|INT
armata-rossa|D|Rrahmani|6|NAP
armata-rossa|D|Dossena|1|CAG
armata-rossa|D|Ranieri|1|FIO
armata-rossa|D|Rodriguez|1|TOR
armata-rossa|D|Romagnoli S.|1|FRO
armata-rossa|D|Ruggeri|1|ATA
armata-rossa|C|Rabiot|20|JUV
armata-rossa|C|Mkhitaryan|13|INT
armata-rossa|C|Pessina|12|MON
armata-rossa|C|Bajrami|2|SAS
armata-rossa|C|Cataldi|1|LAZ
armata-rossa|C|Kastanos|1|SAL
armata-rossa|C|Malinovskyi|1|GEN
armata-rossa|C|Ramadani|1|LEC
armata-rossa|C|Strootman|1|GEN
armata-rossa|A|Gonzalez N.|90|FIO
armata-rossa|A|Vlahovic|31|JUV
armata-rossa|A|Luvumbo|30|CAG
armata-rossa|A|Raspadori|15|NAP
armata-rossa|A|Caprari|1|MON
armata-rossa|A|Defrel|1|SAS
armata-rossa|A|Pavoletti|1|CAG
real-monghi|P|Provedel|8|LAZ
real-monghi|P|Costil|1|SAL
real-monghi|P|Fiorillo|1|SAL
real-monghi|P|Mandas|1|LAZ
real-monghi|P|Ochoa|1|SAL
real-monghi|P|Sepe|1|LAZ
real-monghi|D|Posch|22|BOL
real-monghi|D|Perez|13|UDI
real-monghi|D|Martinez Quarta|5|FIO
real-monghi|D|Augello|3|CAG
real-monghi|D|De Vrij|1|INT
real-monghi|D|Ebuehi|1|EMP
real-monghi|D|Juan Jesus|1|NAP
real-monghi|D|Kumbulla|1|SAS
real-monghi|D|Ostigard|1|NAP
real-monghi|C|Pulisic|45|MIL
real-monghi|C|Calhanoglu|16|INT
real-monghi|C|Duncan|1|FIO
real-monghi|C|Gagliardini|1|MON
real-monghi|C|Makoumbou|1|CAG
real-monghi|C|Ndoye|1|BOL
real-monghi|C|Oudin|1|LEC
real-monghi|C|Vlasic|1|TOR
real-monghi|C|Zurkowski|1|EMP
real-monghi|A|Krstovic|42|LEC
real-monghi|A|Kvaratskhelia|33|NAP
real-monghi|A|Caputo|17|EMP
real-monghi|A|Djuric|9|MON
real-monghi|A|Kouame|4|FIO
real-monghi|A|Lapadula|1|CAG
real-monghi|A|Nzola|1|FIO
sanguemisto|P|Sommer|15|INT
sanguemisto|P|Audero|1|INT
sanguemisto|P|Brancolini|1|LEC
sanguemisto|P|Di Gennaro|1|INT
sanguemisto|P|Falcone|1|LEC
sanguemisto|P|Samooja|1|LEC
sanguemisto|D|Zappacosta|15|ATA
sanguemisto|D|Spinazzola|13|ROM
sanguemisto|D|Calabria|5|MIL
sanguemisto|D|Cuadrado|4|INT
sanguemisto|D|Bakker|1|ATA
sanguemisto|D|Beukema|1|BOL
sanguemisto|D|Birindelli|1|MON
sanguemisto|D|Dorgu|1|LEC
sanguemisto|D|Florenzi|1|MIL
sanguemisto|C|De Ketelaere|40|ATA
sanguemisto|C|Loftus Cheek|16|MIL
sanguemisto|C|Pereyra|13|UDI
sanguemisto|C|Arthur|1|FIO
sanguemisto|C|Freuler|1|BOL
sanguemisto|C|Kostic|1|JUV
sanguemisto|C|Mckennie|1|JUV
sanguemisto|C|Miranchuk|1|ATA
sanguemisto|C|Saelemaekers|1|BOL
sanguemisto|A|Zirkzee|50|BOL
sanguemisto|A|Immobile|35|LAZ
sanguemisto|A|Lucca|30|UDI
sanguemisto|A|Sanabria|12|TOR
sanguemisto|A|Brenner|2|UDI
sanguemisto|A|Banda|1|LEC
sanguemisto|A|Cerri|1|EMP
roburro|P|Aresti|1|CAG
roburro|P|Fiorenza|1|TOR
roburro|P|Gemello|1|TOR
roburro|P|Milinkovic|1|TOR
roburro|P|Radunovic|1|CAG
roburro|P|Scuffet|1|CAG
roburro|D|Milenkovic|13|FIO
roburro|D|Di Lorenzo|9|NAP
roburro|D|Romagnoli A.|9|LAZ
roburro|D|Smalling|7|ROM
roburro|D|Dumfries|6|INT
roburro|D|Tomori|3|MIL
roburro|D|Mario Rui|2|NAP
roburro|D|Mari|1|MON
roburro|D|Pongracic|1|LEC
roburro|C|Frattesi|38|INT
roburro|C|Zaccagni|36|LAZ
roburro|C|Lobotka|10|NAP
roburro|C|Aebischer|1|BOL
roburro|C|Anguissa|1|NAP
roburro|C|Baldanzi|1|ROM
roburro|C|Coulibaly L.|1|SAL
roburro|C|Cristante|1|ROM
roburro|C|Fazzini|1|EMP
roburro|A|Osimhen|42|NAP
roburro|A|Pedro|25|LAZ
roburro|A|Retegui|21|GEN
roburro|A|Pinamonti|16|SAS
roburro|A|Thauvin|15|UDI
roburro|A|Piccoli|5|LEC
roburro|A|Simeone|1|NAP
disperata|P|Szczesny|23|JUV
disperata|P|Consigli|1|SAS
disperata|P|Cragno|1|SAS
disperata|P|Pegolo|1|SAS
disperata|P|Perin|1|JUV
disperata|P|Pinsoglio|1|JUV
disperata|D|Thiaw|15|MIL
disperata|D|Doig|9|SAS
disperata|D|Danilo|8|JUV
disperata|D|Alex Sandro|1|JUV
disperata|D|Dawidowicz|1|VER
disperata|D|Erlic|1|SAS
disperata|D|Gatti|1|JUV
disperata|D|Vasquez|1|GEN
disperata|D|Zortea|1|FRO
disperata|C|Locatelli|11|JUV
disperata|C|Fagioli|10|JUV
disperata|C|Ciurria|7|MON
disperata|C|De Roon|5|ATA
disperata|C|Harroui|5|FRO
disperata|C|Pogba|4|JUV
disperata|C|Alcaraz|1|JUV
disperata|C|Ricci|1|TOR
disperata|C|Yildiz|1|JUV
disperata|A|Martinez L.|39|INT
disperata|A|Leao|37|MIL
disperata|A|Jovic|16|MIL
disperata|A|Almqvist|1|LEC
disperata|A|Henry|1|VER
disperata|A|Soule|1|FRO
disperata|A|Tchaouna|1|SAL
subbuteo|P|Silvestri|2|UDI
subbuteo|P|Cerofolini|1|FRO
subbuteo|P|Frattali|1|FRO
subbuteo|P|Okoye|1|UDI
subbuteo|P|Padelli|1|UDI
subbuteo|P|Turati|1|FRO
subbuteo|D|Kristiansen|7|BOL
subbuteo|D|Baschirotto|2|LEC
subbuteo|D|Dodo|1|FIO
subbuteo|D|Gendrey|1|LEC
subbuteo|D|Kolasinac|1|ATA
subbuteo|D|Lazaro|1|TOR
subbuteo|D|Lazzari|1|LAZ
subbuteo|D|Lucumi|1|BOL
subbuteo|D|Valeri|1|FRO
subbuteo|C|Felipe Anderson|85|LAZ
subbuteo|C|Luis Alberto|20|LAZ
subbuteo|C|Ederson|12|ATA
subbuteo|C|Colpani|7|MON
subbuteo|C|Cambiaghi|3|EMP
subbuteo|C|Pasalic|2|ATA
subbuteo|C|Folorunsho|1|VER
subbuteo|C|Ilic|1|TOR
subbuteo|C|Suslov|1|VER
subbuteo|A|Berardi|29|SAS
subbuteo|A|Dybala|28|ROM
subbuteo|A|Belotti|19|FIO
subbuteo|A|Mota|3|MON
subbuteo|A|Cheddira|1|FRO
subbuteo|A|Sanchez|1|INT
subbuteo|A|Vitinha|1|GEN
prosecco|P|Leali|1|GEN
prosecco|P|Maignan|1|MIL
prosecco|P|Martinez J.|1|GEN
prosecco|P|Mirante|1|MIL
prosecco|P|Sommariva|1|GEN
prosecco|P|Sportiello|1|MIL
prosecco|D|Carlos Augusto|10|INT
prosecco|D|Bastoni A.|7|INT
prosecco|D|Monterisi|5|FRO
prosecco|D|Cambiaso|3|JUV
prosecco|D|Bisseck|1|INT
prosecco|D|Kristensen R.|1|ROM
prosecco|D|Llorente|1|ROM
prosecco|D|Lykogiannis|1|BOL
prosecco|D|Pavard|1|INT
prosecco|C|Reijnders|22|MIL
prosecco|C|Barella|18|INT
prosecco|C|Chukwueze|7|MIL
prosecco|C|Sottil|5|FIO
prosecco|C|Asllani|1|INT
prosecco|C|Duda|1|VER
prosecco|C|Isaksen|1|LAZ
prosecco|C|Oristanio|1|CAG
prosecco|C|Samardzic|1|UDI
prosecco|A|Thuram|116|INT
prosecco|A|Lukaku|31|ROM
prosecco|A|Okafor|12|MIL
prosecco|A|Karlsson|3|BOL
prosecco|A|Arnautovic|1|INT
prosecco|A|Azmoun|1|ROM
prosecco|A|Beltran|1|FIO
sporting-mangiapreti|P|Berisha E.|1|EMP
sporting-mangiapreti|P|Caprile|1|EMP
sporting-mangiapreti|P|Christensen|1|FIO
sporting-mangiapreti|P|Martinelli|1|FIO
sporting-mangiapreti|P|Perisan|1|EMP
sporting-mangiapreti|P|Terracciano|1|FIO
sporting-mangiapreti|D|Biraghi|12|FIO
sporting-mangiapreti|D|Calafiori|10|BOL
sporting-mangiapreti|D|Vojvoda|5|TOR
sporting-mangiapreti|D|Kyriakopoulos|3|MON
sporting-mangiapreti|D|Luperto|2|EMP
sporting-mangiapreti|D|Buongiorno|1|TOR
sporting-mangiapreti|D|Ebosele|1|UDI
sporting-mangiapreti|D|Gallo|1|LEC
sporting-mangiapreti|D|Parisi|1|FIO
sporting-mangiapreti|C|Guendouzi|20|LAZ
sporting-mangiapreti|C|Candreva|15|SAL
sporting-mangiapreti|C|Lauriente|9|SAS
sporting-mangiapreti|C|Brescianini|1|FRO
sporting-mangiapreti|C|Fabbian|1|BOL
sporting-mangiapreti|C|Frendrup|1|GEN
sporting-mangiapreti|C|Iling Jr.|1|JUV
sporting-mangiapreti|C|Messias|1|GEN
sporting-mangiapreti|C|Viola|1|CAG
sporting-mangiapreti|A|Giroud|80|MIL
sporting-mangiapreti|A|Milik|58|JUV
sporting-mangiapreti|A|Zapata|15|TOR
sporting-mangiapreti|A|Toure|3|ATA
sporting-mangiapreti|A|Gudmundsson|1|GEN
sporting-mangiapreti|A|Mulattieri|1|SAS
sporting-mangiapreti|A|Shpendi|1|EMP
aston-ville|P|Rui Patricio|13|ROM
aston-ville|P|Berardi A.|1|VER
aston-ville|P|Boer|1|ROM
aston-ville|P|Montipo|1|VER
aston-ville|P|Perilli|1|VER
aston-ville|P|Svilar|1|ROM
aston-ville|D|Dimarco|41|INT
aston-ville|D|Bremer|7|JUV
aston-ville|D|Holm|5|ATA
aston-ville|D|Mancini|5|ROM
aston-ville|D|Mazzocchi|4|NAP
aston-ville|D|Caldirola|1|MON
aston-ville|D|Djimsiti|1|ATA
aston-ville|D|Magnani|1|VER
aston-ville|D|Viti|1|SAS
aston-ville|C|Chiesa|73|JUV
aston-ville|C|Aouar|15|ROM
aston-ville|C|Pellegrini Lo.|14|ROM
aston-ville|C|Lazovic|1|VER
aston-ville|C|Lindstrom|1|NAP
aston-ville|C|Miretti|1|JUV
aston-ville|C|Rovella|1|LAZ
aston-ville|C|Walace|1|UDI
aston-ville|C|Weah|1|JUV
aston-ville|A|Dia|30|SAL
aston-ville|A|Castellanos|10|LAZ
aston-ville|A|Ngonge|10|NAP
aston-ville|A|Petagna|9|CAG
aston-ville|A|Destro|1|EMP
aston-ville|A|Kaio Jorge|1|FRO
aston-ville|A|Pellegri|1|TOR
$X$, E'\n') r where r <> '') t;
