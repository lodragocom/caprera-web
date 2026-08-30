-- Fix the previous migration error by using quoted column name
CREATE OR REPLACE FUNCTION get_players_by_season(season_filter text, fonte_filter text)
RETURNS TABLE(
  player_id bigint,
  listone_nome text,
  "position" text,
  team text,
  costo_base integer,
  presenze integer,
  media_voto numeric,
  fantamedia numeric,
  goals integer,
  assists integer,
  red integer,
  yellow integer,
  stagione text,
  fonte text,
  photo_url text,
  team_logo text
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    v.player_id,
    v.listone_nome,
    v."position",
    v.team,
    v.costo_base,
    v.presenze,
    v.media_voto,
    v.fantamedia,
    v.goals,
    v.assists,
    v.red,
    v.yellow,
    v.stagione,
    v.fonte,
    g.photo_url,
    g.team_logo
  FROM v_giocatori_completi v
  LEFT JOIN giocatori g ON v.player_id = g.player_id
  WHERE v.stagione = season_filter AND v.fonte = fonte_filter;
$$;

-- Create function to get player career
CREATE OR REPLACE FUNCTION get_player_career(player_name text)
RETURNS TABLE(
  stagione text,
  costo_asta integer,
  presenze integer,
  media_voto numeric,
  fantamedia numeric,
  fonte text
)
LANGUAGE SQL 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    v.stagione,
    v.costo_asta,
    v.presenze,
    v.media_voto,
    v.fantamedia,
    v.fonte
  FROM v_giocatori_completi v
  WHERE v.listone_nome = player_name
  ORDER BY v.stagione DESC;
$$;
