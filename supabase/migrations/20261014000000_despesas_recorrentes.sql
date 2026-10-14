create table if not exists public.despesas_recorrentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao text not null check (length(trim(descricao)) between 1 and 120),
  valor numeric(12, 2) not null check (valor > 0),
  categoria text not null,
  dia_mes integer not null check (dia_mes between 1 and 31),
  proxima_execucao date not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists despesas_recorrentes_execucao_idx
  on public.despesas_recorrentes (proxima_execucao)
  where ativo;

alter table public.despesas_recorrentes enable row level security;

drop policy if exists "Utilizadores consultam as suas despesas recorrentes"
  on public.despesas_recorrentes;
create policy "Utilizadores consultam as suas despesas recorrentes"
  on public.despesas_recorrentes
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Utilizadores criam as suas despesas recorrentes"
  on public.despesas_recorrentes;
create policy "Utilizadores criam as suas despesas recorrentes"
  on public.despesas_recorrentes
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Utilizadores atualizam as suas despesas recorrentes"
  on public.despesas_recorrentes;
create policy "Utilizadores atualizam as suas despesas recorrentes"
  on public.despesas_recorrentes
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Utilizadores eliminam as suas despesas recorrentes"
  on public.despesas_recorrentes;
create policy "Utilizadores eliminam as suas despesas recorrentes"
  on public.despesas_recorrentes
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.processar_despesas_recorrentes()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  recorrencia record;
  hoje date := (now() at time zone 'Europe/Lisbon')::date;
  data_execucao date;
  primeiro_dia_mes_seguinte date;
  ultimo_dia_mes_seguinte date;
  total_criado integer := 0;
begin
  for recorrencia in
    select *
    from public.despesas_recorrentes
    where ativo
      and proxima_execucao <= hoje
    order by proxima_execucao
    for update skip locked
  loop
    data_execucao := recorrencia.proxima_execucao;

    while data_execucao <= hoje loop
      insert into public.despesas (
        user_id,
        descricao,
        valor,
        categoria,
        created_at
      )
      values (
        recorrencia.user_id,
        recorrencia.descricao,
        recorrencia.valor,
        recorrencia.categoria,
        data_execucao::timestamp at time zone 'Europe/Lisbon'
      );

      total_criado := total_criado + 1;
      primeiro_dia_mes_seguinte :=
        (date_trunc('month', data_execucao)::date + interval '1 month')::date;
      ultimo_dia_mes_seguinte :=
        (primeiro_dia_mes_seguinte + interval '1 month - 1 day')::date;
      data_execucao :=
        primeiro_dia_mes_seguinte
        + least(
            recorrencia.dia_mes,
            extract(day from ultimo_dia_mes_seguinte)::integer
          ) - 1;
    end loop;

    update public.despesas_recorrentes
    set proxima_execucao = data_execucao
    where id = recorrencia.id;
  end loop;

  return total_criado;
end;
$$;

revoke all on function public.processar_despesas_recorrentes() from public;
revoke all on function public.processar_despesas_recorrentes() from anon;
revoke all on function public.processar_despesas_recorrentes() from authenticated;
grant execute on function public.processar_despesas_recorrentes() to service_role;
