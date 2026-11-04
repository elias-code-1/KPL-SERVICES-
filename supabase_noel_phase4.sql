-- ==============================================================================
-- KPL SERVICES - Script SQL Phase 4 : Réservations Spéciales Noël
-- ==============================================================================
-- À exécuter dans le SQL Editor de votre projet Supabase.
-- Ce script est entièrement idempotent : vous pouvez le relancer sans risque.
-- ==============================================================================

-- 1. Création de la table reservations_noel
create table if not exists public.reservations_noel (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) >= 2 and char_length(nom) <= 120),
  telephone text not null check (char_length(telephone) >= 6 and char_length(telephone) <= 30),
  email text check (email is null or char_length(email) <= 200),
  type_prestation text,
  pack_id uuid references public.packs_noel(id) on delete set null,
  pack_nom text,
  prix_pack numeric,
  date_livraison date,
  heure_livraison text,
  ville_lieu text check (ville_lieu is null or char_length(ville_lieu) <= 200),
  budget text,
  notes text check (notes is null or char_length(notes) <= 2000),
  statut text not null default 'recu' check (statut in ('recu', 'acompte_verse', 'en_preparation', 'livre', 'annule')),
  acompte numeric not null default 0 check (acompte >= 0),
  created_at timestamptz default now()
);

-- 2. Activation de Row Level Security (RLS)
alter table public.reservations_noel enable row level security;

-- 3. Index de performance
create index if not exists idx_reservations_noel_statut 
  on public.reservations_noel(statut);

create index if not exists idx_reservations_noel_date_livraison 
  on public.reservations_noel(date_livraison);

-- 4. Suppression des anciennes policies pour garantir l'idempotence
drop policy if exists "reservations_noel_insert_public" on public.reservations_noel;
drop policy if exists "reservations_noel_admin_all" on public.reservations_noel;

-- 5. Policy d'insertion pour le public (visiteurs anon et authenticated)
-- Uniquement avec statut 'recu' et acompte initial à 0.
-- Aucune policy de select n'est accordée à anon (sécurité & confidentialité strictes).
create policy "reservations_noel_insert_public"
  on public.reservations_noel
  for insert
  to anon, authenticated
  with check (statut = 'recu' and acompte = 0);

-- 6. Policy d'accès complet pour les administrateurs (authenticated)
create policy "reservations_noel_admin_all"
  on public.reservations_noel
  for all
  to authenticated
  using (true)
  with check (true);

-- 7. Activation de Supabase Realtime pour les notifications instantanées
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'reservations_noel'
  ) then
    alter publication supabase_realtime add table public.reservations_noel;
  end if;
end $$;
