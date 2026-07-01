#!/usr/bin/env python3
"""
Applique le footer légal STOOM et le consentement cookies aux pages HTML existantes.
À exécuter depuis la racine du dépôt stoom-site-v2 après avoir copié les fichiers
du dossier "a-ajouter-au-depot".
"""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
PAGES = [
    path for path in ROOT.glob("*.html")
    if path.name not in {
        "mentions-legales.html",
        "politique-confidentialite.html",
        "politique-cookies.html",
        "reglement-concours.html",
    }
]

GTM_HEAD = re.compile(
    r"\s*<!--\s*Google Tag Manager\s*-->\s*<script>.*?GTM-WCXHT7C9.*?</script>\s*<!--\s*End Google Tag Manager\s*-->",
    re.IGNORECASE | re.DOTALL,
)
GTM_NOSCRIPT = re.compile(
    r"\s*<!--\s*Google Tag Manager \(noscript\)\s*-->.*?<!--\s*End Google Tag Manager \(noscript\)\s*-->",
    re.IGNORECASE | re.DOTALL,
)
GOOGLE_PRECONNECT = re.compile(
    r"\s*<link\s+rel=[\"']preconnect[\"'][^>]*href=[\"']https://fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*",
    re.IGNORECASE,
)
GOOGLE_FONT_STYLESHEET = re.compile(
    r"\s*<link[^>]*href=[\"']https://fonts\.googleapis\.com/[^\"']+[\"'][^>]*>\s*",
    re.IGNORECASE,
)
MAP_IFRAME = re.compile(
    r"<iframe(?P<before>[^>]*?)\s+src=(?P<quote>[\"'])(?P<src>https://www\.google\.com/maps[^\"']*?output=embed)(?P=quote)(?P<after>[^>]*)>",
    re.IGNORECASE | re.DOTALL,
)

def protect_map(match: re.Match) -> str:
    before = match.group("before")
    after = match.group("after")
    source = match.group("src")
    if "data-stoom-map" in before or "data-stoom-map" in after:
        return match.group(0)
    return f'<iframe{before} data-stoom-map data-src="{source}" src="about:blank"{after}>'

def patch(page: Path) -> bool:
    original = page.read_text(encoding="utf-8")
    updated = original

    # Le chargement de GTM est repris par assets/site-shell.js uniquement après consentement.
    updated = GTM_HEAD.sub(
        '\n  <!-- Google Tag Manager chargé après consentement via assets/site-shell.js -->',
        updated,
    )
    updated = GTM_NOSCRIPT.sub("", updated)

    # On supprime les appels externes Google Fonts : les CSS présentes prévoient déjà Arial/Georgia.
    updated = GOOGLE_PRECONNECT.sub("\n", updated)
    updated = GOOGLE_FONT_STYLESHEET.sub("\n", updated)

    # Les cartes Google Maps restent bloquées jusqu'à accord sur la catégorie "Contenu externe".
    updated = MAP_IFRAME.sub(protect_map, updated)

    # Les pages existantes appellent toutes age-check.js ; celui-ci charge désormais site-shell.js.
    # Sécurité pour une future page qui n'aurait pas l'âge-check.
    if "assets/age-check.js" not in updated and "assets/site-shell.js" not in updated:
        updated = re.sub(
            r"</body>",
            '  <script src="assets/site-shell.js" defer></script>\n</body>',
            updated,
            count=1,
            flags=re.IGNORECASE,
        )

    if updated == original:
        return False

    page.write_text(updated, encoding="utf-8")
    return True

changed = [page.name for page in PAGES if patch(page)]
print("Pages mises à jour :", ", ".join(changed) if changed else "aucune")
