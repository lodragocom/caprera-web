-- I contratti si vedono, i soldi no.
--
-- Chi ha sotto contratto chi, e fino a quando, e' informazione di lega: sta
-- su Fantapazz e sulla pagina pubblica del sito da sempre. Clausola e
-- ingaggio invece sono denaro, e il denaro resta riservato - oggi quelle due
-- colonne sono vuote, ma quando arriveranno i dati di Guido saranno piene, e
-- e' meglio che la finestra sia gia' della misura giusta.
create or replace view public.contratti_pubblici
with (security_invoker = on) as
  select societa, nome, ruolo, under, dalla, alla, anni
    from caprera.contratti;

-- La vista eredita le regole di riga di caprera.contratti, che mostrano a
-- ciascuno solo i propri. Per questa finestra serve invece che si veda tutto:
-- ha senso perche' non contiene importi.
alter view public.contratti_pubblici set (security_invoker = off);
grant select on public.contratti_pubblici to anon, authenticated;
