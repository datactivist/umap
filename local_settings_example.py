# -*- coding:utf-8 -*-

"""
Example settings for local development

Use this file as a base for your local development settings and copy
it to umap/settings/local.py. It should not be checked into
your code repository.

"""

from umap.settings.base import *  # pylint: disable=W0614,W0401

SECRET_KEY = "!!change me!!"
INTERNAL_IPS = ("127.0.0.1",)
ALLOWED_HOSTS = [
    "*",
]

# Simple password protection (temporary)
# Set to None to disable password protection
SIMPLE_PASSWORD_PROTECTION = "odv"

DEBUG = True

ADMINS = (("You", "your@email"),)
MANAGERS = ADMINS

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "umap",
        "USER": "umap",
    }
}

LANGUAGE_CODE = "en"

# Set to False if login into django account should not be possible. You can
# administer accounts in the admin interface.
ENABLE_ACCOUNT_LOGIN = True

"""LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}
"""

AUTHENTICATION_BACKENDS = (
    "social_core.backends.github.GithubOAuth2",
    # "social_core.backends.bitbucket.BitbucketOAuth",
    # "social_core.backends.twitter.TwitterOAuth",
    "social_core.backends.openstreetmap_oauth2.OpenStreetMapOAuth2",
    "django.contrib.auth.backends.ModelBackend",
)
SOCIAL_AUTH_GITHUB_KEY = "GITHUB_KEY"
SOCIAL_AUTH_GITHUB_SECRET = "GITHUB_SECRET"
SOCIAL_AUTH_BITBUCKET_KEY = "BITBUCKET_KEY"
SOCIAL_AUTH_BITBUCKET_SECRET = "BITBUCKET_SECRET"
# We need email to associate with other Oauth providers
SOCIAL_AUTH_GITHUB_SCOPE = [
    "user:email",
]
SOCIAL_AUTH_TWITTER_KEY = "TWITTER_KEY"
SOCIAL_AUTH_TWITTER_SECRET = "TWITTER_SECRET"
SOCIAL_AUTH_OPENSTREETMAP_OAUTH2_KEY = "OSM_KEY"
SOCIAL_AUTH_OPENSTREETMAP_OAUTH2_SECRET = "OSM_SECRET"
MIDDLEWARE += ("social_django.middleware.SocialAuthExceptionMiddleware",)
SOCIAL_AUTH_REDIRECT_IS_HTTPS = False
SOCIAL_AUTH_RAISE_EXCEPTIONS = False
SOCIAL_AUTH_BACKEND_ERROR_URL = "/"

# If you want to add a playgroud map, add its primary key
# UMAP_DEMO_PK = 204
# If you want to add a showcase map on the home page, add its primary key
# UMAP_SHOWCASE_PK = 1156
# Add a baner to warn people this instance is not production ready.
UMAP_DEMO_SITE = True

# Whether to allow non authenticated people to create maps.
UMAP_ALLOW_ANONYMOUS = True

# This setting will exclude empty maps (in fact, it will exclude all maps where
# the default center has not been updated)
UMAP_EXCLUDE_DEFAULT_MAPS = False

# How many maps should be showcased on the main page resp. on the user page
UMAP_MAPS_PER_PAGE = 5
# How many maps should be looked for when performing a (sub)search
UMAP_MAPS_PER_SEARCH = 15
# How many maps should be showcased on the user page, if owner
UMAP_MAPS_PER_PAGE_OWNER = 10

SITE_URL = "http://localhost:8000"
SHORT_SITE_URL = "http://s.hort"

# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
#         'LOCATION': '/var/tmp/django_cache',
#     }
# }

# POSTGIS_VERSION = (2, 1, 0)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Put the site in readonly mode (useful for migration or any maintenance)
UMAP_READONLY = False


# For static deployment
STATIC_ROOT = "/srv/umap/var/static"

# For users' statics (geojson mainly)
MEDIA_ROOT = "/srv/umap/var/data"

# Default map location for new maps
LEAFLET_LONGITUDE = 2.2137
LEAFLET_LATITUDE = 47.7640
LEAFLET_ZOOM = 7
UMAP_FOCUS_COUNTRY = "FR"

# Number of old version to keep per datalayer.
UMAP_KEEP_VERSIONS = 10

# UMAP_DATA_API = "https://api.umap.datactivist.coop/api/v1/"
UMAP_DATA_API = "http://localhost:8001/api/v1/"

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
                "description": "Ce jeu de données concerne l’ensemble des arbres urbains référencés dans l’open data. Pour plus d'information, se reporter à a description du jeu de données dans le lien qui mène à la source.",
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
                "label": "BPE - Base Permanente des Equipements (Aires de jeux)",
                "data": "bpe",
                "geographic_query": "commune",
                "format": "umap-data",
                "source": "https://www.data.gouv.fr/fr/datasets/base-permanente-des-equipements-1/",
                "description": "La BPE permet de mieux connaître les équipements de service à la population et le niveau de ces équipements sur un territoire. La base permanente des équipements (BPE) est une base de données qui vise à rassemble des données administratives relatives aux équipements de service à la population. Les données de la BPE concernent uniquement les aires de jeux afin de pouvoir répondre à l'enjeu de surchauffe des jeux et équipements pour les enfants (cf tavaux de Plus fraîche ma ville : https://plusfraichemaville.fr/fiche-solution/jeux-et-equipements-durables-ecoles).",
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
