# Déploiement – Naledji (instructions)

Prérequis:
- Un provider Postgres (Heroku Postgres, Supabase, Railway, etc.)
- (Optionnel) Compte Twilio pour SMS
- Variables d'environnement à définir:
  - DATABASE_URL
  - DATABASE_SSL (true/false)
  - ADMIN_TOKEN
  - ADMIN_PHONE (optionnel)
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (optionnel)

1) Initialiser la base de données
- Exécuter le script SQL `migrations/init.sql` sur la base Postgres (pgcli, psql, ou via interface provider).

2) Déployer
- Recommande: Vercel (intégration Git; serverless functions detectées automatiquement).
- Sur Vercel, connecter le repo, déployer la branche `refonte-storytelling`.
- Dans les Settings > Environment Variables, ajouter les variables listées ci‑dessus.

3) Tester
- Visiter `/` pour la home, `/checkout.html` pour le checkout
- Faire une commande (POST vers `/api/orders`), vérifier que la ligne est insérée dans la table `orders`.
- Accéder à `/admin.html` et entrer l'ADMIN_TOKEN pour voir les commandes.

Security notes:
- Ne pas stocker tokens secrets dans le repo.
- Env vars dans Vercel/Netlify sont sécurisées.
