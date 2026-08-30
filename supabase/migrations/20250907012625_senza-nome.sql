-- Create a function to execute raw SQL queries for views
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS TABLE(result json)
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT to_json(t) FROM (' || query || ') t';
END;
$$;
