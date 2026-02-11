# Outil de visualisation - Rafraîchissement des villes

Cet outil est une extension d'uMap, un logiciel open source permettant de créer des cartes personnalisées à partir de données géographiques.

- Le site officiel d'uMap : [umap-project.org](https://umap-project.org)
- La documentation technique : [docs.umap-project.org](https://docs.umap-project.org/en/stable/)
- Vous pouvez également les suivre via [Matrix](https://matrix.to/#/#umap:matrix.org), le [forum](https://forum.openstreetmap.fr/c/utiliser/umap/29) ou la [liste de diffusion](https://lists.openstreetmap.org/listinfo/umap)

Cette version d'uMap intègre un outil de visualisation et de rafraîchissement des données des villes à partir de sources externes.
Une API permettant de fournir les données relatives à notre cas d'usage a également été développée et est disponible ici : [Documentation API](https://github.com/datactivist/umap-data-api).

## Installation

Dans le cadre de ce projet, uMap et l'API de données ont été installés sur une VM dédiée avec les capacités et dépendances suivantes :

- Ubuntu 22.04
- Python 3.10.10
- PostgreSQL 16 avec l'extension PostGIS
- 1 GB de mémoire vive
- 25 GB d'espace de stockage
- 1 vCPU

Veuillez suivre les instructions d'installation standard d'uMap disponibles dans la [documentation officielle](https://docs.umap-project.org/en/stable/install/).

## Mise à jour du contenu

Le contenu du site web doit être mis à jour directement depuis le code source disponible sur ce dépôt GitHub. Pour cela il faut donc faire les modifications nécessaires dans le code source et redéployer l'application.

## Configuration

Un exemple de configuration, qui a été utilisé dans le cadre du projet est disponible dans le fichier `local_settings_example.py` à la racine du dépôt. Dans le cadre d'un déploiement il conviendra de changer à minima les clés d'API et les secrets pour les services d'authentification (ex : Github, OSM), les variables indiquant les URLs d'accès aux applications, ainsi que le mot de passe de protection simple :

- `SOCIAL_AUTH_GITHUB_KEY`
- `SOCIAL_AUTH_GITHUB_SECRET`
- `SOCIAL_AUTH_OPENSTREETMAP_OAUTH2_KEY`
- `SOCIAL_AUTH_OPENSTREETMAP_OAUTH2_SECRET`
- `SITE_URL`
- `UMAP_DATA_API`
- `SIMPLE_PASSWORD_PROTECTION`

De plus, il est possible d'ajouter des fonds de cartes et des licences personnalisées depuis les tables de la base Postgre créée suite à l'installation d'uMap. Pour cela, il suffit d'ajouter les entrées correspondantes dans les tables `umap_tilelayer` et `umap_licence` de la base de données.

### Protection par mot de passe (temporaire)

Une protection par mot de passe simple a été ajoutée pour contrôler l'accès à l'application. Cette fonctionnalité peut être activée en ajoutant la configuration suivante dans `local_settings.py` :

```python
# Protection par mot de passe simple (temporaire)
# Définir à None pour désactiver la protection
SIMPLE_PASSWORD_PROTECTION = "umap2025"
```

Lorsque cette fonctionnalité est activée :

- Tous les utilisateurs doivent entrer le mot de passe pour accéder à l'application
- L'authentification est stockée dans la session Django
- Les fichiers statiques et la page de connexion sont exemptés de la protection

Pour désactiver la protection, définissez `SIMPLE_PASSWORD_PROTECTION = None` ou supprimez complètement le paramètre.

**Note :** Il s'agit d'une solution temporaire utilisant un mot de passe partagé unique. Pour un environnement de production avec des données sensibles, utilisez un système d'authentification approprié.

### Sources de données pour l'import

Les sources de données utilisées dans l'assistant d'import peuvent être définies dans le fichier de configuration `local_settings.py` d'uMap.
Dans la variable `UMAP_IMPORTERS`, il est possible d'ajouter des datasets provenant de l'API de données comme cela :

```python
{
    "label": "Arbres (namR)",
    "data": "arbres", # Nom de la clé dans l'API
    "geographic_query": "commune", # Geographic filter in the API
    "format": "umap-data",
    "source": "https://www.data.gouv.fr/datasets/arbres-en-open-data-en-france-par-namr/",
    "description": "Ce jeu de données concerne l’ensemble des arbres urbains référencés dans l’open data.",
},
```

Voici un exemple de configuration qui utilise entre autres l'API Overpass pour OpenStreetMap ainsi qu'une API développée pour notre cas d'usage :

```python
UMAP_IMPORTERS = {
    "overpass": {"url": "https://overpass-api.de/api/interpreter"},
    "communesfr": {"name": "Communes françaises"},
    # ---------------------------
    #  SOLUTIONS VERTES
    # ---------------------------
    "datasets": {
        "name": "Données vertes",
        "choices": [
            # Espaces verts — split per tag
            {
                "label": "Espaces verts — grass (OSM)",
                "expression": "nwr[landuse=grass];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:landuse%3Dgrass",
            },
            {
                "label": "Espaces verts — forest (OSM)",
                "expression": "nwr[landuse=forest];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:landuse%3Dforest",
            },
            {
                "label": "Espaces verts — nature_reserve (OSM)",
                "expression": "nwr[leisure=nature_reserve];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dnature_reserve",
            },
            {
                "label": "Espaces verts — recreation_ground (OSM)",
                "expression": "nwr[leisure=recreation_ground];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:leisure%3Drecreation_ground",
            },
        ],
    },
    # ---------------------------
    #  SOLUTIONS BLEUES
    # ---------------------------
    "datasets-2": {
        "name": "Données bleues",
        "choices": [
            # Fontaines décoratives
            {
                "label": "Fontaines (OSM)",
                "expression": "nwr[amenity=fountain];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dfountain",
                "description": "Une fontaine ayant une importance culturelle, décorative ou historique ou qui sert à des fins récréatives.",
            },
            # Fontaines à eau potable
            {
                "label": "Fontaines à eau potable (OSM)",
                "expression": "nwr[amenity=drinking_water];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:amenity%3Ddrinking_water",
                "description": "Indique l'emplacement d'un robinet ou autre accès à de l'eau potable, ce qui inclut puits, robinets et sources.",
            }
        ],
    },
}
```
