-- Tables created via SQL migrations don't automatically get the table-level
-- grants that Supabase's dashboard Table Editor adds for you. RLS policies
-- only filter rows; without these grants every query fails with
-- "permission denied for table ..." before RLS is even evaluated.
grant select, insert, update, delete on public.games to authenticated;
grant select, insert, update, delete on public.stations to authenticated;
