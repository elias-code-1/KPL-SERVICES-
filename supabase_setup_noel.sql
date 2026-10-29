-- =========================================================================
-- KPL SERVICES - CONFIGURATION SUPABASE POUR LES RÉSERVATIONS & LE THÈME NOËL
-- À exécuter dans votre Dashboard Supabase > SQL Editor > New query > Run
-- =========================================================================

-- 1. TABLE RESERVATIONS : Autoriser l'insertion publique des réservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert reservations" ON reservations;
CREATE POLICY "Public insert reservations"
ON reservations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access reservations" ON reservations;
CREATE POLICY "Admin full access reservations"
ON reservations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. TABLE MESSAGES : Autoriser l'envoi public des formulaires de contact
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert messages" ON messages;
CREATE POLICY "Public insert messages"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access messages" ON messages;
CREATE POLICY "Admin full access messages"
ON messages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. TABLE SITE_SETTINGS : Pour synchroniser l'interrupteur Noël (Admin <-> Public)
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings"
ON site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage site_settings" ON site_settings;
CREATE POLICY "Admin manage site_settings"
ON site_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Initialiser la configuration Noël par défaut
INSERT INTO site_settings (key, value)
VALUES (
  'christmas_config',
  '{"isEnabled": true, "bannerText": "Féerie de Noël chez KPL SERVICES : Réservez vos surprises & décorations de fin d''année !", "showSnow": true, "highlightPacks": true}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
