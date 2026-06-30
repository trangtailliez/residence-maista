# Brancher le formulaire MAISTÀ → Google Sheet + email + CRM

Le formulaire du site envoie chaque demande à un **Google Apps Script** qui :
1. ajoute une ligne dans un Google Sheet,
2. envoie un email de notification à **contact@aloe-immo.fr**,
3. (optionnel) transmet le lead au **CRM Aloé**.

Tout vit sous le compte Google **contact@aloe-immo.fr** (Workspace) — aucune dépendance externe, aucun secret exposé sur le site.

---

## Étapes (≈ 5 min, à faire une seule fois)

> ⚠️ Réalise ces étapes **connecté en `contact@aloe-immo.fr`** pour que la feuille et les emails appartiennent à ce compte.

1. **Créer la feuille** : va sur https://sheets.new → renomme-la « Leads MAISTÀ ».
2. **Ouvrir l'éditeur de script** : menu **Extensions → Apps Script**.
3. **Coller le code** : supprime le contenu par défaut, colle tout le contenu de [`Code.gs`](Code.gs), puis **Enregistrer** (icône disquette).
4. **Déployer en Web App** :
   - Bouton **Déployer → Nouveau déploiement**.
   - Type (roue dentée) → **Application Web**.
   - *Exécuter en tant que* : **Moi (contact@aloe-immo.fr)**.
   - *Qui a accès* : **Tout le monde**.
   - **Déployer** → autorise les accès demandés (Google affiche un avertissement « non vérifié » : **Paramètres avancés → Accéder à (non sécurisé)** → Autoriser. C'est ton propre script, c'est normal).
5. **Copier l'URL** de déploiement qui se termine par **`/exec`**.
   - Test rapide : ouvre cette URL dans le navigateur → tu dois voir `{"ok":true,...}`.
6. **Donner l'URL** : colle-la-moi (ou remplace toi-même `__LEAD_ENDPOINT__` par cette URL dans `index.html`, fonction *Form submit*). Je redéploie et le formulaire est live.

---

## Brancher le CRM Aloé (quand l'info sera connue)

Dans `Code.gs`, section **CONFIG**, renseigne **une** des deux options :

- **Email-to-lead** (le plus simple) : `var CRM_EMAIL = 'adresse-import-du-crm@…';`
- **API / Webhook** : `var CRM_WEBHOOK = 'https://…';` (+ `CRM_WEBHOOK_TOKEN` si une clé est requise).

Puis **Déployer → Gérer les déploiements → (crayon) → Nouvelle version → Déployer**.
⚠️ L'URL `/exec` **ne change pas** entre les versions : rien à modifier côté site.

---

## Vérifier / maintenir

- **Voir les leads** : ils s'empilent dans l'onglet « Leads » de la feuille.
- **Modifier le destinataire email** : variable `NOTIFY_EMAIL` en haut de `Code.gs`.
- **Spam** : un champ caché (honeypot `website`) filtre les robots ; les soumissions remplies sont ignorées silencieusement.
- **RGPD** : pense à lier une politique de confidentialité au consentement du formulaire (page à créer).
