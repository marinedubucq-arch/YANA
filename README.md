# YANA – You Are Not Alone

Plateforme pour entrepreneurs solo qui veulent travailler ensemble dans des lieux workers-friendly.

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Base de données** : Supabase (PostgreSQL + temps réel)
- **Authentification** : NextAuth.js + LinkedIn OpenID Connect
- **Carte** : Leaflet.js + OpenStreetMap (gratuit, sans clé API)
- **UI** : Tailwind CSS
- **Déploiement** : Netlify

---

## 1. Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com) → Créer un compte gratuit
2. Créez un nouveau projet (notez l'URL et les clés API dans **Settings → API**)
3. Dans **SQL Editor**, copiez-collez et exécutez tout le contenu de `supabase/schema.sql`

→ Cela crée les 5 tables et insère les 20 premiers lieux.

---

## 2. Créer l'application LinkedIn

1. Allez sur [linkedin.com/developers](https://www.linkedin.com/developers/) → **Create app**
2. Nom : `YANA` | Logo : votre logo | Company : votre page LinkedIn
3. Dans l'onglet **Auth** :
   - Ajoutez le produit **"Sign In with LinkedIn using OpenID Connect"**
   - Dans **Authorized redirect URLs**, ajoutez :
     - `http://localhost:3000/api/auth/callback/linkedin` (dev)
     - `https://votre-site.netlify.app/api/auth/callback/linkedin` (prod)
4. Copiez le **Client ID** et **Client Secret**

---

## 3. Variables d'environnement

Copiez `.env.example` en `.env.local` et remplissez les valeurs :

```bash
cp .env.example .env.local
```

```env
NEXTAUTH_SECRET=            # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

LINKEDIN_CLIENT_ID=         # depuis votre app LinkedIn
LINKEDIN_CLIENT_SECRET=     # depuis votre app LinkedIn

NEXT_PUBLIC_SUPABASE_URL=   # depuis Supabase Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # NE JAMAIS exposer côté client !

ADMIN_SECRET=               # un mot de passe fort pour /admin
```

---

## 4. Lancer en local

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 5. Déployer sur Netlify

### Option A – Via GitHub (recommandé)

1. Pushez le dossier `yana/` sur un repo GitHub
2. Sur [netlify.com](https://netlify.com), cliquez **Add new site → Import from Git**
3. Sélectionnez votre repo
4. Build command : `npm run build` | Publish directory : `.next`
5. Dans **Site settings → Environment variables**, ajoutez toutes les variables de `.env.example` avec vos vraies valeurs
6. Dans **Site settings → Build & deploy → Plugins**, vérifiez que `@netlify/plugin-nextjs` est actif (il se détecte automatiquement via `netlify.toml`)

### Option B – Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set NEXTAUTH_SECRET "votre_secret"
# ... répétez pour chaque variable
netlify deploy --prod
```

### ⚠️ Après déploiement

Mettez à jour `NEXTAUTH_URL` avec votre vraie URL Netlify, et ajoutez l'URL de callback LinkedIn en production dans votre app LinkedIn Developer.

---

## 6. Accéder au backoffice

Naviguez sur `/admin` et entrez le token que vous avez défini dans `ADMIN_SECRET`.

Vous pouvez :
- Ajouter / activer / désactiver / supprimer des lieux
- Gérer les utilisateurs
- Consulter les demandes des établissements
- Consulter les suggestions de lieux

### Trouver les coordonnées d'un lieu

Pour ajouter un nouveau lieu, vous avez besoin de la latitude et longitude :
- Allez sur [maps.google.com](https://maps.google.com)
- Clic droit sur le lieu → **"Qu'est-ce qu'il y a ici ?"**
- Les coordonnées s'affichent en bas (ex: `48.8566, 2.3522`)

---

## Architecture des fichiers

```
src/
├── app/
│   ├── page.js                    # Landing page
│   ├── dashboard/page.js          # Interface principale (carte + liste)
│   ├── admin/page.js              # Backoffice
│   └── api/
│       ├── auth/[...nextauth]/    # Auth LinkedIn
│       ├── venues/                # GET lieux avec présence temps réel
│       ├── presence/              # POST/DELETE/GET présence utilisateur
│       ├── users/                 # PATCH profil utilisateur
│       ├── suggestions/           # POST suggestion de lieu
│       ├── establishments/        # POST demande établissement
│       └── admin/                 # Routes protégées admin
│           ├── venues/
│           ├── users/
│           └── requests/
├── components/
│   ├── MapComponent.jsx           # Carte Leaflet (SSR désactivé)
│   ├── VenueCard.jsx             # Carte d'un lieu dans la liste
│   ├── ProfileModal.jsx           # Popup de complétion de profil
│   ├── PresenceModal.jsx          # Sélection matin/aprèm/journée
│   ├── SuggestVenue.jsx           # Formulaire suggestion lieu
│   └── AuthProvider.jsx           # Wrapper NextAuth SessionProvider
└── lib/
    ├── supabase.js                # Clients Supabase (public + admin)
    └── paris-time.js              # Logique fuseau horaire Paris
```

---

## Logique de présence

- Chaque utilisateur peut signaler **une présence par jour** (un lieu à la fois)
- Les créneaux : `morning` (visible avant 12h Paris), `afternoon` (visible après 12h), `full_day` (toujours visible)
- Les données se remettent à zéro automatiquement au lendemain (la date est stockée, donc les pastilles du jour précédent n'apparaissent pas)
- La carte se rafraîchit automatiquement toutes les 2 minutes

---

## Roadmap possible

- [ ] Notifications push quand quelqu'un est dans le même lieu
- [ ] Système de messagerie entre utilisateurs du même lieu
- [ ] Ajout d'autres villes françaises
- [ ] Mode sombre
- [ ] Application mobile (React Native)
