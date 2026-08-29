-- La rosa di settembre 2021-22 come sta nel foglio della Presidenza, scheda
-- «Rose Finali». Ventiquattro giocatori di movimento per squadra: i sei portieri
-- mancano perche' in quel blocco sono scritti i club invece dei nomi.
-- I nomi sono battuti a mano: DeVrij, Kulusewski, Mhkytarian, Saalemakers, Ibra,
-- Delefeu, Malynowski, Hiyckey. Vanno ricondotti alle grafie d'archivio, e il
-- modo sicuro e' passare dalla rosa di maggio della stessa societa'.
drop table if exists lavoro.settembre_2021_22;
create table lavoro.settembre_2021_22 (
  societa text, ruolo char, nome text, costo int, calciatore int, come_in_archivio text);

insert into lavoro.settembre_2021_22 (societa, ruolo, nome, costo)
select v[1], v[2], v[3], v[4]::int
from (select string_to_array(r,'|') v from regexp_split_to_table($X$
armata-rossa|D|Hernandez|13
armata-rossa|D|Skriniar|10
armata-rossa|D|Criscito|1
armata-rossa|D|Yoshida|1
armata-rossa|D|Erlic|1
armata-rossa|D|Fares|1
armata-rossa|D|Ibanez|10
armata-rossa|D|Maksimovic|1
armata-rossa|C|Tonali|8
armata-rossa|C|Lazovic|1
armata-rossa|C|kessie|1
armata-rossa|C|Veretout|30
armata-rossa|C|Anguissa|1
armata-rossa|C|Agudelo|1
armata-rossa|C|Busio|1
armata-rossa|C|Veloso|1
armata-rossa|A|Vlahovic|90
armata-rossa|A|Gonzalez N|37
armata-rossa|A|simy|1
armata-rossa|A|politano|1
armata-rossa|A|Shomourodov|1
armata-rossa|A|Lozano|22
armata-rossa|A|Kallon|1
armata-rossa|A|Satriano|1
aston-ville|D|Mancini|8
aston-ville|D|Nastasic|1
aston-ville|D|Faraoni|5
aston-ville|D|De Silvestri|1
aston-ville|D|Koulibaly|1
aston-ville|D|Ghiglione|1
aston-ville|D|Colley|2
aston-ville|D|FerrariG|1
aston-ville|D|Reynolds|1
aston-ville|C|Pellegrini|19
aston-ville|C|Strootman|1
aston-ville|C|Maxime Lopez|1
aston-ville|C|Maggiore|1
aston-ville|C|Nandez|1
aston-ville|C|Praet|1
aston-ville|C|Castrovilli|26
aston-ville|C|Rabiot|1
aston-ville|A|Belotti|30
aston-ville|A|Arnautovic|48
aston-ville|A|Morata|50
aston-ville|A|Ribery|1
aston-ville|A|Cutrone|1
aston-ville|A|Simeone|1
aston-ville|A|Kaio George|1
disperata|D|DeLigt|9
disperata|D|Kumbulla|5
disperata|D|Cuadrado|30
disperata|D|Demiral|1
disperata|D|Danilo|1
disperata|D|Godin|1
disperata|D|Toloi|22
disperata|D|AlexSandro|1
disperata|D|Calafiori|1
disperata|C|Pasalic|16
disperata|C|Locatelli|25
disperata|C|Bernardeschi|1
disperata|C|Mandragora|1
disperata|C|Ricci|1
disperata|C|Betancur|1
disperata|C|Artur|1
disperata|C|Pessina|1
disperata|A|Martinez|33
disperata|A|Pjaca|1
disperata|A|Barrow|1
disperata|A|Leao|20
disperata|A|Zaza|1
disperata|A|Keita|1
disperata|A|Cancellieri|1
prosecco|D|Bastoni A|20
prosecco|D|Darmian|1
prosecco|D|Dumfries|1
prosecco|D|DeVrij|1
prosecco|D|Zortea|1
prosecco|D|Kyriakopoulous|1
prosecco|D|Vina|1
prosecco|D|Tomori|1
prosecco|C|Kulusewski|19
prosecco|C|Milinkovic S|60
prosecco|C|Brozovic|1
prosecco|C|Barella|25
prosecco|C|Sensi|1
prosecco|C|Bennacer|1
prosecco|C|Carles Perez|1
prosecco|C|Vidal|1
prosecco|C|Zalewski|1
prosecco|A|Correa|80
prosecco|A|Dzeko|1
prosecco|A|Sanchez|1
prosecco|A|Petagna|1
prosecco|A|Rebic|1
prosecco|A|Kean|1
prosecco|A|Buksa|1
real-monghi|D|Spinazzola|7
real-monghi|D|Augello|1
real-monghi|D|BastoniS.|1
real-monghi|D|Caceres|1
real-monghi|D|Kjaer|1
real-monghi|D|Acerbi|21
real-monghi|D|Molina|11
real-monghi|D|Stojanovic|1
real-monghi|D|Soppy|1
real-monghi|C|Calhanoglu|18
real-monghi|C|Damsgaard|10
real-monghi|C|Callejon|1
real-monghi|C|Diaz B|20
real-monghi|C|Deiola|1
real-monghi|C|Hernani|1
real-monghi|C|Ilic|1
real-monghi|C|LeoSena|1
real-monghi|A|Caputo|28
real-monghi|A|Insigne|36
real-monghi|A|Henry|1
real-monghi|A|Mancuso|60
real-monghi|A|Piccoli|1
real-monghi|A|Verde|1
real-monghi|A|Karamoko|1
roburro|D|Smalling|7
roburro|D|Larsen|1
roburro|D|Odriozola|4
roburro|D|DJIMSITI|1
roburro|D|IZZO|1
roburro|D|Manolas|1
roburro|D|Florenzi|1
roburro|D|DiLorenzo|1
roburro|C|Zielinski|30
roburro|C|Freuler|1
roburro|C|De Roon|1
roburro|C|SVANBERG|1
roburro|C|SCHOUTEN|1
roburro|C|Torreira|6
roburro|C|Djuricic|40
roburro|C|Thorsby|1
roburro|C|Baldanzi|1
roburro|C|Rovella|8
roburro|A|Osimhen|28
roburro|A|Miranchuk|16
roburro|A|Muriel|15
roburro|A|Ilicic|40
roburro|A|NZOLA|1
roburro|A|Sanabria|1
sanguemisto|D|Udogie|1
sanguemisto|D|Cambiaso|1
sanguemisto|D|Romagnoli|1
sanguemisto|D|Hysaj|1
sanguemisto|D|Chiellini|1
sanguemisto|D|Calabria|25
sanguemisto|D|Berejinski|1
sanguemisto|D|Gagliolo|1
sanguemisto|D|Dragusin|1
sanguemisto|C|Samardzic|1
sanguemisto|C|Candreva|1
sanguemisto|C|Verre|1
sanguemisto|C|Cristante|1
sanguemisto|C|Verdi|1
sanguemisto|C|Perisic|1
sanguemisto|C|Vignato|1
sanguemisto|C|Elmas|1
sanguemisto|C|Askildsen|1
sanguemisto|A|Zapata|81
sanguemisto|A|Immobile|120
sanguemisto|A|Quagliarella|1
sanguemisto|A|Pavoletti|1
sanguemisto|A|Scamacca|1
sanguemisto|A|Inerhatten|1
smit|D|Hateboer|8
smit|D|Lazzari|10
smit|D|Nuytinck|7
smit|D|Martinez 4a|1
smit|D|Magnani|1
smit|D|Karsdorp|1
smit|D|Mario rui|1
smit|D|Carboni|1
smit|C|Zaniolo|16
smit|C|Frattesi|10
smit|C|Koopmeiners|1
smit|C|Mhkytarian|45
smit|C|Pereyra|22
smit|C|Zaccagni|18
smit|C|Saalemakers|1
smit|C|Maleh|1
smit|C|Bove|1
smit|A|Orsolini|1
smit|A|Abraham|100
smit|A|Raspadori|1
smit|A|Ibra|50
smit|A|El Shaarawy|1
smit|A|Delefeu|1
smit|A|Pellegri|1
sporting-mangiapreti|D|Gosens|15
sporting-mangiapreti|D|DiMarco|1
sporting-mangiapreti|D|Hiyckey|1
sporting-mangiapreti|D|Palomino|1
sporting-mangiapreti|D|Biraghi|1
sporting-mangiapreti|D|Ceccaroni|1
sporting-mangiapreti|D|Caldara|1
sporting-mangiapreti|D|Bremer|1
sporting-mangiapreti|C|Chiesa|23
sporting-mangiapreti|C|Aramu|8
sporting-mangiapreti|C|Bajrami|19
sporting-mangiapreti|C|Traore|1
sporting-mangiapreti|C|Marin|1
sporting-mangiapreti|C|Brekalo|1
sporting-mangiapreti|C|McKennie|18
sporting-mangiapreti|C|Soriano|1
sporting-mangiapreti|A|Lasagna|15
sporting-mangiapreti|A|Caicedo|1
sporting-mangiapreti|A|Mertens|1
sporting-mangiapreti|A|Malynowski|36
sporting-mangiapreti|A|Pussetto|1
sporting-mangiapreti|A|Giroud|80
sporting-mangiapreti|A|Salcedo|8
sporting-mangiapreti|A|Moro|1
subbuteo|D|Bonucci|8
subbuteo|D|Singo|10
subbuteo|D|Mahele|9
subbuteo|D|Milenkovic|1
subbuteo|D|MARCHIZZA|1
subbuteo|D|Zappacosta|1
subbuteo|D|Ruggeri|1
subbuteo|D|Luis felipe|1
subbuteo|C|LuisAlberto|21
subbuteo|C|BONAVENTURA|1
subbuteo|C|MESSIAS|1
subbuteo|C|BARAK|1
subbuteo|C|FABIANRUIZ|1
subbuteo|C|Felipe Anderson|8
subbuteo|C|Bandinelli|1
subbuteo|C|Pobega|1
subbuteo|C|Podgoreanu|1
subbuteo|C|Darboe|1
subbuteo|A|Dybala|31
subbuteo|A|Berardi|51
subbuteo|A|Boga|39
subbuteo|A|Destro|1
subbuteo|A|Pedro|55
subbuteo|A|JOAOPEDRO|1
$X$, E'\n') r where r <> '') t;

-- Primo aggancio: chi e' rimasto fino a maggio nella stessa societa'.
-- Si confronta la grafia ridotta a sole lettere minuscole, cosi' «DeVrij» trova
-- «De Vrij» e «AlexSandro» trova «Alex Sandro».
update lavoro.settembre_2021_22 s
   set calciatore = r.calciatore, come_in_archivio = r.nome
  from caprera.rose r
 where r.stagione='2021-22' and r.momento='fine' and r.societa = s.societa and r.ruolo = s.ruolo
   and regexp_replace(lower(r.nome), '[^a-z]', '', 'g') = regexp_replace(lower(s.nome), '[^a-z]', '', 'g');
