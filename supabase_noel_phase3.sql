-- ==============================================================================
-- KPL SERVICES - Script SQL Phase 3 : Gestion des Packs de Noël
-- ==============================================================================
-- À exécuter dans le SQL Editor de votre projet Supabase.
-- Ce script est entièrement idempotent : vous pouvez le relancer sans risque.
-- ==============================================================================

-- 1. Création de la table packs_noel
create table if not exists public.packs_noel (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  prix numeric, -- null = sur devis
  contenu text[] not null default '{}',
  actif boolean not null default false,
  ordre integer not null default 0,
  created_at timestamptz default now()
);

-- 2. Activation de Row Level Security (RLS)
alter table public.packs_noel enable row level security;

-- 3. Suppression des anciennes policies pour garantir l'idempotence
drop policy if exists "packs_noel_select_public_active" on public.packs_noel;
drop policy if exists "packs_noel_admin_all" on public.packs_noel;

-- 4. Policy de lecture pour les visiteurs (anon) et utilisateurs : uniquement les packs actifs
create policy "packs_noel_select_public_active"
  on public.packs_noel
  for select
  to anon, authenticated
  using (actif = true);

-- 5. Policy d'accès complet pour les utilisateurs authentifiés (admin)
-- Permet de lire (y compris les inactifs/brouillons), insérer, modifier et supprimer
create policy "packs_noel_admin_all"
  on public.packs_noel
  for all
  to authenticated
  using (true)
  with check (true);

-- 6. Insertion des quatre packs brouillons initiaux (uniquement si la table est vide)
do $$
begin
  if not exists (select 1 from public.packs_noel limit 1) then
    insert into public.packs_noel (nom, description, prix, contenu, actif, ordre)
    values
      (
        'Féerie Enfant',
        'Une expérience féerique conçue pour émerveiller les plus jeunes et toute la famille lors des fêtes.',
        null,
        '{}',
        false,
        1
      ),
      (
        'Magie en Couple',
        'Une ambiance intime et chaleureuse pour célébrer Noël et le Réveillon à deux en toute élégance.',
        null,
        '{}',
        false,
        2
      ),
      (
        'Réveillon Prestige',
        'Une décoration et scénographie haut de gamme pour sublimer vos dîners et réceptions festives.',
        null,
        '{}',
        false,
        3
      ),
      (
        'Arbre de Noël Entreprise',
        'Une célébration corporate complète et féerique pour vos collaborateurs, comités et leurs familles.',
        null,
        '{}',
        false,
        4
      );
  end if;
end $$;
