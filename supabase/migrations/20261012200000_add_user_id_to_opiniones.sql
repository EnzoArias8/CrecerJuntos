alter table public.opiniones
  add column if not exists usuario_id uuid references auth.users (id) on delete cascade;

create unique index if not exists opiniones_usuario_curso_unique
  on public.opiniones (usuario_id, curso_slug)
  where usuario_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'opiniones'
      and policyname = 'Users can insert their own course opinions'
  ) then
    create policy "Users can insert their own course opinions"
      on public.opiniones
      for insert
      to authenticated
      with check (auth.uid() = usuario_id);
  end if;
end
$$;
