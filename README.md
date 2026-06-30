# MAISTÀ — Site vitrine · Handoff Claude Code

Site one-page de présentation de la **Résidence MAISTÀ** (programme immobilier neuf, 30 appartements, Porticcio — Corse-du-Sud). Objectif : générer des contacts (formulaire de demande d'information).

Ce dossier est un **site statique complet, prêt à mettre en ligne**. Ce n'est pas une simple maquette : `index.html` est le site final, fonctionnel, sans étape de build.

---

## 1. Contenu du dossier

```
design_handoff_maista_site/
├── index.html        ← le site (HTML + CSS inline + JS vanilla)
├── styles.css        ← design system (tokens couleurs / typo / espacements)
├── assets/           ← 10 images (rendus 3D, façade, vue aérienne, plan Corse, logo)
│   ├── residence_perspective.png
│   ├── hero_facade.png
│   ├── three_buildings.png
│   ├── aerial_porticcio.png
│   ├── map_corse.png
│   ├── interior_3d_f2.png  /  interior_3d_f3.png  /  interior_3d_f4.png  /  interior_3d_terrasse.png
│   └── logo_maista.png
└── README.md         ← ce fichier
```

Dépendance externe unique : **Lucide** (icônes) chargé via CDN unpkg dans `index.html`. Aucune autre dépendance, aucun framework, aucun gestionnaire de paquets.

---

## 2. Mise en ligne

C'est un site 100 % statique → n'importe quel hébergeur statique convient.

**Option A — Netlify / Vercel / Cloudflare Pages (recommandé)**
- Déposer le dossier (drag & drop) ou connecter un repo Git.
- Aucune commande de build. Répertoire de publication = la racine de ce dossier.
- Fichier d'entrée : `index.html`.

**Option B — GitHub Pages**
- Pousser le dossier à la racine d'un repo, activer Pages sur la branche `main` (dossier `/root`).

**Option C — hébergement FTP classique**
- Uploader `index.html`, `styles.css` et le dossier `assets/` en conservant la structure.

**Vérifications post-déploiement**
- Les chemins sont **relatifs** (`styles.css`, `assets/…`) → garder la même arborescence.
- Servir en HTTPS (le formulaire et le CDN l'exigent en pratique).
- Tester le responsive : la nav passe en menu burger sous **1040 px**.

### Domaine & SEO
- `<title>` et `<meta name="description">` sont déjà renseignés dans `<head>`.
- À ajouter selon besoin : favicon, balises Open Graph, `robots.txt`, sitemap, et un outil d'analytics (le site n'en embarque aucun).

---

## 3. Le formulaire de contact — À BRANCHER (action requise)

Le formulaire (`#leadForm`) est **fonctionnel côté UI mais sans back-end** : à la soumission, le JS empêche l'envoi réel et affiche un message de remerciement. **Aucun lead n'est transmis pour l'instant.**

Champs : `prenom`, `nom`, `email` (requis), `tel`, `typo` (select F2/F3/F4), `msg`, + case de consentement (requise).

Pour rendre les demandes réellement reçues, au choix :
- **Service de formulaire sans back** (le plus simple) : Formspree, Netlify Forms, Basin… Ajouter l'attribut `action="<endpoint>"` + `method="post"` sur `<form class="lead">` et retirer le `ev.preventDefault()` (ou poster en `fetch`).
- **Endpoint maison** : `POST` JSON vers une fonction serverless qui relaie par e-mail / CRM.

> ⚠️ **RGPD** : les leads contiennent des données personnelles. Prévoir une page Politique de confidentialité, conserver la preuve de consentement, et router les demandes vers les agences commerciales (Agosta Immobilier, ORPI Agence du Golfe, Bastelicaccia Immobilier). Demander l'adresse de réception au client.

Repère dans `index.html` : bloc commenté `<!-- ============ CONTACT ============ -->` et, dans le `<script>` en bas, l'IIFE `// Form submit (demo — no backend)`.

---

## 4. Maintenance — où modifier quoi

Tout est dans `index.html`, structuré par sections commentées (`<!-- ============ NOM ============ -->`).

- **Prix** (« à partir de ») : section `TYPOLOGIES`, classes `.tcard__price .val`. Valeurs actuelles F2 289 000 € · F3 440 000 € · F4 820 000 €. Format des montants : espace fine insécable (`U+202F`), symbole `€`, jamais de virgule de milliers.
- **Surfaces / nb de lots** : section `TYPOLOGIES`, blocs `.tcard__specs` et `.tcard__count`.
- **Chiffres clés** : section `LE PROJET`, bloc `.figs`.
- **Textes** : modifier directement le contenu des balises (français, voix à la 3ᵉ personne, ton immobilier haut de gamme sobre).
- **Images** : remplacer les fichiers dans `assets/` en gardant les mêmes noms, ou mettre à jour les `src`/`background-image`. Privilégier des rendus chauds (lumière de fin d'après-midi), pas de N&B ni de filtre.
- **Agences / intervenants** : sections `CONTACT` (`.contact__agences`) et `FOOTER`.
- **Date de livraison** : « T4 2028 » dans le hero (`.hero__meta`) et le footer.

### Règles d'écriture (charte)
- Titres / eyebrows en **CAPITALES espacées**. Le mot **« Maistà »** porte toujours l'accent à final.
- Chiffres toujours en chiffres (« 30 appartements », « R+2 »). Surfaces avec exposant (`43 m²`).
- Pas d'emoji. Icônes uniquement linéaires dorées (Lucide, `stroke-width:1.25`).

---

## 5. Design system / tokens (`styles.css`)

Variables CSS sous `:root`. Principales :

**Couleurs**
- Marque : `--maista-forest #1F2E26`, `--maista-forest-deep #16221C`, `--maista-gold #C9A75E` (+ `-soft #D9BE82`, `-deep #9C7E3F`).
- Papier / neutres : `--sand-100 #FAF6EE` (fond), `--sand-200 #F1E9D8`, `--ink-900 #111210`, `--ink-700 #2E2C26`, `--ink-500 #6B675D`.
- Filets : `--rule-hairline rgba(31,46,38,.18)`, `--rule-gold` (= gold).
- Bleus/verts paysage (`--sea-500`, `--maquis-500`) **réservés à l'imagerie**, pas aux aplats UI.

**Typographie** (Google Fonts importées dans `styles.css`)
- Display : **Cormorant Garamond** (titres, wordmark, chiffres/prix).
- Texte & eyebrows : **Jost** (capitales très espacées, tracking `0.32em`).
- Classes utilitaires fournies : `.m-display-xl/-l/-m`, `.m-h1/-h2/-h3`, `.m-eyebrow`, `.m-lede`, `.m-body`, `.m-numeral`, `.m-rule-gold`, `.m-on-dark`.

**Rayons** : 0–4 px max (architecture rectiligne). **Ombres** : très discrètes (`--shadow-card`), on préfère les filets dorés. **Motion** : fade only, easing `--ease-out cubic-bezier(.22,.61,.36,1)`, durées `--t-quick/base/slow`.

---

## 6. Comportements / JS (vanilla, en bas de `index.html`)

- **Nav sticky** : transparente sur le hero, devient bandeau crème après ~82 % de la hauteur d'écran (classe `.is-solid`).
- **Reveals au scroll** : fade-up discret (`[data-reveal]` → `.is-in`). Une sonde détecte les contextes où les transitions CSS sont gelées (aperçus embarqués) et affiche alors tout instantanément → **le contenu reste toujours visible**, JS désactivé compris (prévoir éventuellement un repli sans JS si besoin SEO strict).
- **`prefers-reduced-motion`** respecté (animations coupées).
- **Formulaire** : validation HTML5 native + état de confirmation (voir §3).

---

## 7. Évolutions possibles (non incluses)

À proposer au client si pertinent : grille de prix complète des 30 lots, tableau de disponibilités filtrable, plans détaillés par appartement, téléchargement de la plaquette PDF, version bilingue FR/EN, carte interactive, mentions légales / politique de confidentialité.

---

*Source de référence du design : projet « MAISTÀ Design System » (tokens, plaquette, assets extraits de la plaquette commerciale et de la notice descriptive). Le site reprend fidèlement cette charte.*
