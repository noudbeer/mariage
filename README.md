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
cp .env.example .env   # renseigner SESSION_SECRET, ADMIN_EMAILS, WEDDING_DATE...
# Créer data/guests.json (voir data/GUESTS_GUIDE.md) et data/temoins.json (voir data/temoins.example.json)
touch data/rsvp.db && chmod 666 data/rsvp.db   # requis : le conteneur écrit avec un utilisateur non-root
docker compose up -d --build
```

Ce déploiement manuel (`docker compose up -d --build`) reste la bonne solution pour un premier
bring-up ou un environnement de dev/staging construit depuis les sources locales.

## CI/CD (déploiement automatique)

`.github/workflows/deploy.yml` automatise le déploiement en production : à chaque push sur `main`
ou chaque tag `vX.Y.Z`, GitHub Actions construit l'image, la publie sur GHCR
(`ghcr.io/noudbeer/mariage-web`, package privé), puis se connecte en SSH au serveur de prod pour y
lancer `docker compose pull && docker compose up -d`.

Contrairement à `cookbook` (plusieurs services, overlays GPU), le serveur n'a besoin de rien de ce
dépôt : juste un `docker-compose.yml` autonome dans `/srv/mariage` qui référence l'image GHCR (pas
de clone git, pas de `build:`) — même principe que `chalet-bozel`. Voir ci-dessous.

Le serveur de prod héberge déjà un reverse-proxy [Caddy](https://caddyserver.com/) partagé entre
plusieurs apps (`/srv/caddy`, en dehors de ce dépôt, même serveur que `cookbook`/`chalet-bozel`) :
`mariage-web` rejoint son réseau Docker externe `reverseProxy` au lieu de faire tourner un Caddy
dédié, et ne publie aucun port sur l'hôte. Bloc à ajouter dans `/srv/caddy/Caddyfile` :

```
mariage.bernoud.fr {
        reverse_proxy mariage-web:3000 {
                import reverse_proxy_headers
        }
}
```

(`reverse_proxy_headers` est le snippet déjà défini dans `/srv/caddy/Caddyfile` pour les autres
apps du serveur — le réutiliser tel quel.) Après modification, recharger Caddy : `docker compose -f
/srv/caddy/compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile` (ou `restart caddy`
si `reload` échoue).

### Secrets GitHub requis (Settings → Secrets and variables → Actions)

| Secret | Description |
|---|---|
| `SSH_HOST` | IP ou nom d'hôte du serveur de prod |
| `SSH_USER` | Utilisateur SSH (membre du groupe `docker`) |
| `SSH_PORT` | Port SSH (optionnel, défaut 22) |
| `SSH_PRIVATE_KEY` | Clé privée SSH dédiée au déploiement |

Si le serveur est déjà configuré pour `cookbook` (même utilisateur `deploy`, même clé), ces
secrets peuvent être les mêmes valeurs que dans ce dépôt — sinon, en générer de nouveaux comme
ci-dessous. `GITHUB_TOKEN` (fourni automatiquement par Actions, pas un secret à créer) est utilisé
à la fois pour pousser l'image sur GHCR et — transmis via la session SSH — pour authentifier
`docker login` côté serveur juste avant `docker compose pull`.

### Premier déploiement (configuration serveur, une seule fois)

```bash
# Sur le serveur de prod (à sauter si l'utilisateur `deploy` existe déjà pour cookbook/chalet-bozel) :
sudo useradd -m -G docker deploy
sudo -u deploy ssh-keygen -t ed25519 -C gha-deploy -f ~deploy/.ssh/id_ed25519 -N ""
sudo -u deploy sh -c 'cat ~deploy/.ssh/id_ed25519.pub >> ~deploy/.ssh/authorized_keys'
# → coller le contenu de ~deploy/.ssh/id_ed25519 dans le secret GitHub SSH_PRIVATE_KEY

sudo -u deploy mkdir -p /srv/mariage/data
cd /srv/mariage
cp .env.example .env   # renseigner SESSION_SECRET, ADMIN_EMAILS, WEDDING_DATE...
# Créer data/guests.json (voir data/GUESTS_GUIDE.md) et data/temoins.json (voir data/temoins.example.json)
touch data/rsvp.db && chmod 666 data/rsvp.db
```

Puis créer `/srv/mariage/docker-compose.yml` (ce fichier n'a pas besoin d'être versionné — il ne
change quasiment jamais, comme pour `chalet-bozel`) :

```yaml
services:
  mariage-web:
    image: ghcr.io/noudbeer/mariage-web:${IMAGE_TAG:-latest}
    container_name: mariage-web
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data/guests.json:/app/data/guests.json:ro
      - ./data/temoins.json:/app/data/temoins.json:ro
      - ./data/rsvp.db:/app/data/rsvp.db
    networks:
      - reverseProxy

networks:
  reverseProxy:
    external: true
```

Pointer le DNS de `mariage.bernoud.fr` vers ce serveur, et ajouter le bloc Caddy ci-dessus dans
`/srv/caddy/Caddyfile`.

Valider une première fois manuellement avant de compter sur la CI (nécessite un `docker login
ghcr.io` avec un token personnel `read:packages`, le seul cas où un token manuel est utile — la CI
n'en a pas besoin) :

```bash
docker login ghcr.io -u <votre-user-github>   # une seule fois, token personnel read:packages
IMAGE_TAG=latest docker compose pull
IMAGE_TAG=latest docker compose up -d
```

Les push suivants sur `main` (ou les tags) déclenchent le déploiement automatiquement.

### Rollback

```bash
# Sur le serveur, revenir à une version taguée précédente :
IMAGE_TAG=vX.Y.Z docker compose pull
IMAGE_TAG=vX.Y.Z docker compose up -d
```
