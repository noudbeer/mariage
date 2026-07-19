# Guide d'édition de `guests.json`

Ce fichier est la liste des invités. Il n'est **pas suivi par git** (il contient des
données personnelles) — seul `guests.example.json` est versionné comme modèle.

## Structure

```json
{
  "foyers": [
    {
      "id": "foyer-dupont",
      "membres": [
        {
          "id": "jean-dupont",
          "prenom": "Jean",
          "nom": "Dupont",
          "email": "jean.dupont@example.com",
          "invitations": {
            "ceremonie_religieuse": true,
            "vin_honneur": true,
            "repas": true,
            "soiree": true,
            "brunch_lendemain": false
          }
        }
      ]
    }
  ]
}
```

- Un **foyer** regroupe les membres d'une même famille (couple, enfants...).
- Chaque **membre** a ses propres invitations (`true`/`false` pour chaque événement) —
  deux membres du même foyer peuvent être invités à des événements différents.
- L'**email est individuel et optionnel**. Les enfants ou personnes sans adresse email
  peuvent avoir `"email": null` — c'est normal et attendu.
  ⚠️ Utilisez bien `null`, jamais une chaîne vide `""` : une chaîne vide fait échouer
  la validation du fichier **entier**, ce qui empêche tout le monde de se connecter
  (pas seulement le membre concerné).
- **Chaque foyer doit avoir au moins un membre avec un email**, sinon personne ne
  pourra se connecter pour gérer ce foyer.
- N'importe quel membre d'un foyer qui se connecte avec son email peut gérer la
  présence de **tout le foyer**, membre par membre (y compris ceux sans email).

## Règles importantes

- **Ne jamais renommer un `id`** une fois le fichier utilisé en production : les
  réponses RSVP déjà enregistrées sont liées à ces identifiants. Renommer un `id`
  ferait perdre le lien avec les réponses existantes.
- Modifier `prenom`, `nom` ou `email` est sans risque (ne casse pas les RSVP).
- Les `id` doivent être écrits en minuscules, sans accents ni espaces
  (ex. `jean-dupont`), et être uniques dans tout le fichier (foyers et membres).
- Si vous retirez une invitation à un événement pour quelqu'un après coup, une
  éventuelle réponse RSVP déjà enregistrée pour cet événement reste en base mais ne
  sera simplement plus affichée.

## Erreurs de validation

Au démarrage, l'application vérifie le fichier et affiche une erreur claire si :
- un `id` est dupliqué,
- un email est mal formé ou utilisé par plusieurs membres,
- un foyer n'a aucun membre avec email,
- un membre n'a aucune invitation à `true`.
