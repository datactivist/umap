# Outil de visualisation - Rafraîchissement des villes

Cet outil est une extension d'uMap, un logiciel open source permettant de créer des cartes personnalisées à partir de données géographiques.

- Le site officiel d'uMap : [umap-project.org](https://umap-project.org)
- La documentation technique : [docs.umap-project.org](https://docs.umap-project.org/)
- Vous pouvez également les suivre via [Matrix](https://matrix.to/#/#umap:matrix.org), le [forum](https://forum.openstreetmap.fr/c/utiliser/umap/29) ou la [liste de diffusion](https://lists.openstreetmap.org/listinfo/umap)

Cette version d'uMap intègre un outil de visualisation et de rafraîchissement des données des villes à partir de sources externes.
Une API permettant de fournir les données relatives à notre cas d'usage a également été développée et est disponible ici : [API Documentation](https://docs.umap-project.org/api/cities/).

## Installation

Veuillez suivre les instructions d'installation standard d'uMap disponibles dans la [documentation officielle](https://github.com/datactivist/umap-data-api).

## Configuration

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

Les sources de données utilisées dans l'assistant d'import peuvent être définies dans le fichier de configuration `local_settings.py` d'uMap. Voici un exemple de configuration qui utilise entre autres l'API Overpass pour OpenStreetMap ainsi qu'une API développée pour notre cas d'usage :

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
            # Itinéraires de tramways — split per route
            {
                "label": "Itinéraires de tramways — tram (OSM)",
                "expression": "nwr[route=tram];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:route%3Dtram",
            },
            {
                "label": "Itinéraires de tramways — light_rail (OSM)",
                "expression": "nwr[route=light_rail];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:route%3Dlight_rail",
            },
            # Arbres — natural=tree
            {
                "label": "Arbres (OSM)",
                "expression": "nwr[natural=tree];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:natural%3Dtree",
            },
            {
                "label": "Arbres (namR)",
                "data": "arbres",
                "geographic_query": "commune",
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
            # Fontaines à eau potable
            {
                "label": "Fontaines à eau potable (OSM)",
                "expression": "nwr[amenity=drinking_water];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:amenity%3Ddrinking_water",
                "description": "Indique l'emplacement d'un robinet ou autre accès à de l'eau potable, ce qui inclut puits, robinets et sources.",
            },
            # Douches publiques
            {
                "label": "Douches publiques (OSM)",
                "expression": "nwr[amenity=shower];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:amenity%3Dshower",
                "description": "Douches publiques, où les gens peuvent se baigner sous des jets d'eau. Elles peuvent être gérées par les pouvoirs publics en tant qu'équipement local ou faire partie d'une offre commerciale et donc être payantes. Les douches de plage sont également signalées de cette manière.",
            },
            # Stockage d'eau
            {
                "label": "Stockage d'eau (OSM)",
                "expression": "nwr[man_made=storage_tank][content=water];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:man_made%3Dwater_tank",
            },
            # Points d'eau pour animaux
            {
                "label": "Points d'eau pour animaux (OSM)",
                "expression": "nwr[amenity=watering_place];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:amenity%3Dwatering_place",
                "description": "Cet attribut indique les endroits où les animaux peuvent boire de l'eau,",
            },
            # Espaces extérieurs rafraîchis : parcs, jardins, squares (split per tag)
            {
                "label": "Parcs (OSM)",
                "expression": "nwr[leisure=park];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:leisure%3Dpark",
            },
            {
                "label": "Jardins (OSM)",
                "expression": "nwr[leisure=garden];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dgarden",
            },
            {
                "label": "Squares (OSM)",
                "expression": "nwr[place=square];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/FR:Tag:place%3Dsquare",
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
    # ---------------------------
    #  SOLUTIONS GRISES
    # ---------------------------
    "datasets-3": {
        "name": "Données grises",
        "choices": [
            # Musées
            {
                "label": "Musées (OSM)",
                "expression": "nwr[tourism=museum];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:tourism=museum",
                "description": "Un musée. Institution qui présente des expositions sur des thèmes culturels, historiques, scientifiques. Peut être fortement impliqué dans l'acquisition, la conservation ou la recherche dans ces domaines. En général ouvert au public en tant qu'attraction touristique.",
            },
            # Centres commerciaux (shopping malls)
            {
                "label": "Centres commerciaux (OSM)",
                "expression": "nwr[shop=mall];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:shop=mall",
            },
            # Bâtiments publics / commerciaux (split per tag)
            {
                "label": "Bâtiments — commercial (OSM)",
                "expression": "nwr[building=commercial];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:building=commercial",
            },
            {
                "label": "Bâtiments — retail (OSM)",
                "expression": "nwr[building=retail];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:building=retail",
            },
            {
                "label": "Bâtiments — public_building (OSM)",
                "expression": "nwr[amenity=public_building];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:amenity=public_building",
            },
            {
                "label": "Bâtiments — public (OSM)",
                "expression": "nwr[building=public];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:building=public",
            },
            # Ombrières — split per tag
            {
                "label": "Ombrières — canopy (OSM)",
                "expression": "nwr[man_made=canopy];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:man_made=canopy",
            },
            {
                "label": "Ombrières — shelter (OSM)",
                "expression": "nwr[amenity=shelter];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:amenity=shelter",
            },
            {
                "label": "Ombrières — tree (OSM)",
                "expression": "nwr[natural=tree];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:natural%3Dtree",
            },
            {
                "label": "Ombrières — wood (OSM)",
                "expression": "nwr[natural=wood];out geom;",
                "format": "osm",
                "source": "https://wiki.openstreetmap.org/wiki/Tag:natural=wood",
            },
            {
                "label": "Réseau de froid",
                "data": "reseaux-froid",
                "geographic_query": "commune",
                "format": "umap-data",
                "source": "https://france-chaleur-urbaine.beta.gouv.fr/carte",
            },
            {
                "label": "BPE - Base Permanente des Equipements",
                "data": "bpe",
                "geographic_query": "commune",
                "format": "umap-data",
                "source": "https://www.data.gouv.fr/fr/datasets/base-permanente-des-equipements-1/",
                "description": "La BPE permet de mieux connaître les équipements de service à la population et le niveau de ces équipements sur un territoire. La base permanente des équipements (BPE) est une base de données qui vise à rassemble des données administratives relatives aux équipements de service à la population.",
            },
        ],
    },
    # ---------------------------
    #  Everything else unchanged
    # ---------------------------
    "datasets-4": {
        "name": "Données d'exposition",
        "choices": [
            {
                "label": "MAPuCE",
                "data": "mapuce",
                "geographic_query": "commune",
                "format": "umap-data",
                "source": "https://github.com/orbisgis/mapuce.orbisgis.org/tree/gh-pages/data/icu",
                "description": "Données sur les ICU. Travaux réalisés il y a 6 ans",
            }
        ],
    },
    "datasets-5": {
        "name": "Données de contexte",
        "choices": [
            {
                "label": "Population",
                "data": "population",
                "geographic_query": "commune",
                "format": "umap-data",
            }
        ],
    },
}
```