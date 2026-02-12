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

Le contenu du site web doit être mis à jour directement depuis le code source disponible sur ce dépôt GitHub. Pour cela il faut donc faire les modifications nécessaires dans le code source puis redéployer l'application via la méthodedé déploiement mise en place dans votre architecture.

Par exemple, si vous souhaitez modifiez le lien de téléchargement du bouton "Tutoriel" ainsi que celui dans les pop-ups du tutoriel :

- Télécharger le code source depuis ce dépôt et l'ouvrir dans l'éditeur de code de votre choix
- Trouver les occurrences du lien de téléchargement dans le code source via l'outil de recherche de votre éditeur (ex : rechercher `https://datactivist.github.io/umap-tutorial/`).
- Remplacer ces occurences par le nouveau lien.
- Redéployer l'application.

Alternativement, il est possible de faire les changements directement depuis Github (ou un autre outil de gestion de code source selon où votre code est hébergé) en utilisant l'interface de recherche et de modification de fichiers, puis de redéployer l'application.

Si vous souhaitez faire des modifications sur la description des fichiers importés, il est possible de le faire depuis la configuration d'uMap, comme indiqué dans le chapitre [Sources de données pour l'import](#sources-de-données-pour-limport) ci-dessous.

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

Les sources de données utilisées dans l'assistant d'import peuvent être définies dans le fichier de configuration `local_settings.py` d'uMap. Dans la variable `UMAP_IMPORTERS`, où il est possible de définir le label, la requête d'extraction des données, le format de ces données, ainsi que la source et une description de celles-ci.

Une partie des données ont été sélectionnées et prétraités pour répondre à notre cas d'usage. Pour importer ces données depuis umap, nous avons développé une API et son connecteur associé. **La documentation d'installation de l'API qui permet de fournir ces données, ainsi que la méthode pour ajouter de nouvelles données à celle-ci sont disponible dans le dépôt dédié : [Documentation API](https://github.com/datactivist/umap-data-api).**
Le fonctionnement au niveau de la configuration est donc le même aussi bien pour les connecteurs d'API existantes que pour celui que nous avons développé pour notre cas d'usage.
Pour ajouter un connecteur à une API qui ne figure pas parmis ceux déjà supportées (**overpass, communesfr, cadastrefr, banfr, API du cas d'usage**), il est nécessaire de réaliser une **intégration spécifique** à la nouvelle API dans le code de uMap, en suivant la structure des intégrations existantes. Cela peut inclure la création d'une nouvelle classe d'importateur qui gère les requêtes à l'API et le formatage des données pour qu'elles soient compatibles avec uMap.



Voici un exemple de configuration de la variable `UMAP_IMPORTERS`. _Pour un exemple complet de la configuration utilisé dans le cadre du projet, veuillez vous référer au fichier `local_settings_example.py` à la racine du dépôt._

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
                "label": "Arbres (namR)",
                "data": "arbres", # Nom de la clé dans l'API
                "geographic_query": "commune", # Geographic filter in the API
                "format": "umap-data",
                "source": "https://www.data.gouv.fr/datasets/arbres-en-open-data-en-france-par-namr/",
                "description": "Ce jeu de données concerne l’ensemble des arbres urbains référencés dans l’open data.",
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
            {
                "label": "BD Topage",
                "data": "topage",
                "geographic_query": "commune",
                "format": "umap-data",
                "source": "https://www.data.gouv.fr/fr/datasets/bd-topage-r/",
                "description": "Le référentiel hydrographique vise à décrire les entités hydrographiques présentes sur le territoire français afin de constituer un référentiel national permettant de localiser des données relatives à l’eau.",
            },
        ],
    },
}
```
