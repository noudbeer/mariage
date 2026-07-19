# Mariage de Tiffany & Simon

Site du mariage : programme personnalisé, confirmation de présence (RSVP), thème, contact des témoins, et galerie photo post-mariage (Immich).

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS + Framer Motion
- SQLite (Drizzle ORM) pour les réponses RSVP
- `iron-session` pour l'authentification par email (sans mot de passe)
- Déploiement self-hosted en Docker, derrière Caddy

## Développement

```bash
pnpm install
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Données invités

La liste des invités se gère dans `data/guests.json`. Voir `data/GUESTS_GUIDE.md` pour le format et les règles d'édition.

## Témoins

Les coordonnées des témoins (page `/temoins`) se gèrent dans `data/temoins.json` (voir `data/temoins.example.json`
pour le format). Comme `guests.json`, ce fichier est relu à chaque requête : **modifier `data/temoins.json` suffit,
aucun rebuild ni redémarrage n'est nécessaire** (que ce soit en `pnpm dev` ou dans le conteneur Docker, puisqu'il est
monté en volume).

## Déploiement

```bash
cp .env.example .env   # renseigner SESSION_SECRET, ADMIN_USER, ADMIN_PASSWORD, WEDDING_DATE...
# Créer data/guests.json (voir data/GUESTS_GUIDE.md) et data/temoins.json (voir data/temoins.example.json)
touch data/rsvp.db && chmod 666 data/rsvp.db   # requis : le conteneur écrit avec un utilisateur non-root
docker compose up -d --build
```

Voir `docker-compose.yml` et le bloc Caddy fourni en commentaire dans ce même fichier pour l'intégration au reverse proxy existant sur le NAS.
