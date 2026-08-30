-- `v_forma` serve alle "ultime cinque" della panoramica, e non diceva contro
-- chi. In pagina restava scritto "in casa di" seguito dal vuoto - lo si e'
-- visto guardando l'area di un'altra societa', che e' esattamente a cosa
-- serve poterle guardare. `v_gare` sotto lo sapeva gia': bastava non buttarlo.
create or replace view caprera.v_forma as
  select stagione, societa, giornata,
         case when gol_fatti > gol_subiti then 'V'
              when gol_fatti = gol_subiti then 'N'
              else 'P' end as esito,
         gol_fatti, gol_subiti, fantapunti,
         avversario, in_casa
    from caprera.v_gare
   where competizione = 'campionato' and giocata;

create or replace view public.v_forma with (security_invoker = on) as
  select stagione, societa, giornata, esito, gol_fatti, gol_subiti, fantapunti,
         avversario, in_casa
    from caprera.v_forma;
