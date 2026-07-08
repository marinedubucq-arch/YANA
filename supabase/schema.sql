-- ============================================================
-- YANA – Schéma Supabase
-- Exécutez ce script dans Supabase > SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_id       TEXT UNIQUE NOT NULL,
  linkedin_url      TEXT NOT NULL DEFAULT '',
  first_name        TEXT NOT NULL DEFAULT '',
  last_name         TEXT NOT NULL DEFAULT '',
  email             TEXT,
  industry          TEXT NOT NULL DEFAULT '',
  project_name      TEXT,
  profile_complete  BOOLEAN DEFAULT FALSE,
  active            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venues (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT 'Paris',
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  comment     TEXT,
  venue_type  TEXT DEFAULT 'Café',
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presence (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  venue_id    UUID REFERENCES venues(id) ON DELETE CASCADE,
  period      TEXT CHECK (period IN ('morning', 'afternoon', 'full_day')) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS venue_suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  address      TEXT,
  comment      TEXT,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS establishment_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_name   TEXT NOT NULL,
  contact_name         TEXT NOT NULL,
  address              TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT NOT NULL,
  reviewed             BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role (used by API routes) to bypass RLS
-- All access goes through Next.js API routes with service_role key

CREATE POLICY "Service role full access on users"
  ON users FOR ALL USING (true);
CREATE POLICY "Service role full access on venues"
  ON venues FOR ALL USING (true);
CREATE POLICY "Service role full access on presence"
  ON presence FOR ALL USING (true);
CREATE POLICY "Service role full access on venue_suggestions"
  ON venue_suggestions FOR ALL USING (true);
CREATE POLICY "Service role full access on establishment_requests"
  ON establishment_requests FOR ALL USING (true);

-- ── Index pour performances ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_presence_date ON presence(date);
CREATE INDEX IF NOT EXISTS idx_presence_venue ON presence(venue_id);
CREATE INDEX IF NOT EXISTS idx_venues_active ON venues(active);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);

-- ── Données initiales – 20 lieux Paris ───────────────────────
INSERT INTO venues (name, address, city, lat, lng, comment, venue_type) VALUES
  ('16 Rue Cujas',                          '16 Rue Cujas, 75005 Paris',                     'Paris', 48.8495, 2.3427,  'Adresse de référence dans le quartier Latin.',              'Café'),
  ('Salvia Paris Hotel',                    '24 Rue du Faubourg Poissonnière, 75010 Paris',   'Paris', 48.8733, 2.3492,  'Hôtel avec espace de travail ouvert, ambiance zen.',        'Hôtel'),
  ('OCTAVE Batignolles',                    '5 Rue Boursault, 75017 Paris',                   'Paris', 48.8848, 2.3197,  'Café spécialisé café de spécialité, idéal pour travailler.','Café'),
  ('Hotel Eldorado Paris',                  '18 Rue des Dames, 75017 Paris',                  'Paris', 48.8842, 2.3228,  'Hôtel bohème avec jardin, parfait pour une session solo.',  'Hôtel'),
  ('MAIF Social Club',                      '37 Rue de Turenne, 75003 Paris',                 'Paris', 48.8597, 2.3594,  'Espace culturel ouvert à tous, wifi gratuit.',              'Centre culturel'),
  ('Annette K. Seine',                      'Port de Javel Haut, 75015 Paris',                'Paris', 48.8462, 2.2778,  'Péniche avec espace café, vue sur la Seine.',               'Restaurant'),
  ('Maison des Métallos',                   '94 Rue Jean-Pierre Timbaud, 75011 Paris',        'Paris', 48.8637, 2.3756,  'Lieu culturel avec café, atmosphère industrielle chic.',    'Centre culturel'),
  ('La Felicità',                           '5 Parv. Alan Turing, 75013 Paris',               'Paris', 48.8297, 2.3694,  'Cantine de Station F, grande salle lumineuse avec wifi.',   'Restaurant'),
  ('Floréal Belleville',                    '73 Rue Julien Lacroix, 75020 Paris',             'Paris', 48.8681, 2.3846,  'Restaurant avec terrasse calme, fonctionne aussi en café.', 'Restaurant'),
  ('Climbing District Saint-Lazare',        '24 Rue de Madrid, 75008 Paris',                  'Paris', 48.8769, 2.3254,  'Salle d''escalade avec espace café et wifi.',               'Salle de sport'),
  ('Climbing District Batignolles',         '2 Imp. de la Défense, 75017 Paris',              'Paris', 48.8892, 2.3156,  'Salle d''escalade avec café et espace coworking informel.', 'Salle de sport'),
  ('Librairie Hello',                       '8 Rue Trousseau, 75011 Paris',                   'Paris', 48.8548, 2.3736,  'Librairie indépendante avec coins lecture et café.',        'Librairie'),
  ('myWO Saint Lazare Europe',              '35 Rue de Rome, 75008 Paris',                    'Paris', 48.8756, 2.3245,  'Espace de coworking à la journée ou à l''heure.',           'Coworking'),
  ('myWO Saint Lazare Rome',               '79 Rue de Rome, 75017 Paris',                    'Paris', 48.8762, 2.3231,  'Coworking calme près de Saint-Lazare.',                     'Coworking'),
  ('myWO Montmartre Saint Pierre',          '3 Rue du Cardinal Dubois, 75018 Paris',          'Paris', 48.8862, 2.3431,  'Coworking avec vue sur Montmartre.',                        'Coworking'),
  ('myWO Montmartre',                       '58 Rue du Mont Cenis, 75018 Paris',              'Paris', 48.8873, 2.3387,  'Espace de travail dans le vieux Montmartre.',               'Coworking'),
  ('myWO Montmartre Marcadet',              '112 Rue Marcadet, 75018 Paris',                  'Paris', 48.8921, 2.3456,  'Coworking lumineux dans le 18e arrondissement.',            'Coworking'),
  ('myWO Batignolles',                      '27 Rue des Moines, 75017 Paris',                 'Paris', 48.8834, 2.3192,  'Espace de coworking dans le quartier des Batignolles.',     'Coworking'),
  ('Le Hasard Ludique',                     '128 Av. de Saint-Ouen, 75018 Paris',             'Paris', 48.8947, 2.3322,  'Bar restaurant avec jeux de société, clientèle créative.',  'Restaurant'),
  ('Café Pimpin 17',                        '80 Rue Legendre, 75017 Paris',                   'Paris', 48.8831, 2.3201,  'Café de quartier worker-friendly, bonne connexion wifi.',   'Café')
ON CONFLICT DO NOTHING;
