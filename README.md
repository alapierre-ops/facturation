# ProPulse - Système de Facturation

Application complète de gestion de facturation avec système de taxes, devis, projets et administration des utilisateurs.

## 🚀 Fonctionnalités

### 📊 Dashboard
- **Résumé d'activité annuelle** : Chiffre d'affaires, paiements en attente, factures non envoyées
- **Résumé trimestriel** : Navigation entre trimestres, chiffre d'affaires payé/estimé
- **Graphiques** : Évolution mensuelle et annuelle du chiffre d'affaires
- **Barre de progression** : Objectif annuel vs réalisé

### 👥 Gestion des Clients
- Création, édition, suppression de clients
- Recherche avancée (nom, email, téléphone, adresse)
- Protection contre suppression si projets associés

### 📋 Gestion des Projets
- Création, édition, suppression de projets
- Statuts : Pending, Quote Sent, Quote Accepted, Finished, Cancelled
- Mise à jour automatique des statuts selon les devis
- Recherche par nom, description, client
- Affichage par défaut des projets en attente

### 💰 Système de Taxes
- Support multi-pays (USA, France, Monaco)
- Calcul automatique des taxes selon la localisation
- Devises adaptées par pays
- Terminologie anglaise (subtotal/total)

### 📄 Devis et Factures
- Numérotation séquentielle automatique
- Notes et type de paiement
- Statuts : Draft, Sent, Paid
- Protection des factures payées (pas d'édition/suppression)
- Liens cliquables entre devis et factures

### 🔐 Administration des Utilisateurs (Admin uniquement)
- Gestion complète des comptes utilisateurs
- Création, édition, suppression d'utilisateurs
- Changement de mot de passe
- Statistiques par utilisateur
- Rôles : User, Admin

## 🛠️ Installation

### Prérequis
- Node.js 16+
- PostgreSQL
- npm ou yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer DATABASE_URL et JWT_SECRET dans .env
npx prisma migrate dev
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/facturation"
JWT_SECRET="your-secret-key"
PORT=3000
```

### Promouvoir un utilisateur en admin
```bash
cd backend
node scripts/promote-admin.js user@example.com
```

## 📱 Utilisation

### Connexion
1. Créer un compte via `/register`
2. Se connecter via `/login`
3. Pour tester l'admin : promouvoir un utilisateur avec le script

### Dashboard
- Accès automatique après connexion
- Navigation entre trimestres avec les flèches
- Sélection d'année pour les graphiques mensuels

### Gestion des utilisateurs (Admin)
- Accès via "User Management" dans la sidebar (visible uniquement pour les admins)
- Tableau avec actions : Éditer, Supprimer, Changer mot de passe, Voir stats
- Création de nouveaux utilisateurs
- Statistiques détaillées par utilisateur

## 🔒 Sécurité

- Authentification JWT
- Protection des routes sensibles
- Vérification des rôles admin
- Validation des données côté serveur
- Protection contre suppression de données liées

## 🎨 Interface

- Design responsive (mobile/desktop)
- Thème moderne avec Tailwind CSS
- Icônes Feather Icons
- Graphiques interactifs avec Chart.js
- Notifications toast pour les actions

## 📊 Base de données

### Modèles principaux
- **User** : Comptes utilisateurs avec rôles
- **Client** : Clients avec informations de contact
- **Project** : Projets avec statuts
- **Quotes** : Devis avec numérotation
- **Invoice** : Factures avec protection
- **LineQuote/LineInvoice** : Lignes de devis/factures

### Relations
- User → Clients, Projects, Quotes, Invoices
- Client → Projects, Quotes, Invoices
- Project → Quotes, Invoices
- Quote → Invoice

## 🚀 Déploiement

### Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Servir les fichiers statiques
```

## 📝 Notes techniques

- **Backend** : Node.js, Express, Prisma, PostgreSQL
- **Frontend** : React, React Router, Tailwind CSS, Chart.js
- **Authentification** : JWT
- **Validation** : Zod
- **Base de données** : PostgreSQL avec Prisma ORM

## 🔧 Développement

### Structure des dossiers
```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middleware/
│   ├── prisma/
│   └── scripts/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   └── api/
    └── public/
```

### Commandes utiles
```bash
# Générer une migration Prisma
npx prisma migrate dev --name migration_name

# Voir la base de données
npx prisma studio

# Reset de la base
npx prisma migrate reset
```

## 🐛 Dépannage

### Problèmes courants
1. **Erreur de connexion DB** : Vérifier DATABASE_URL
2. **Erreur JWT** : Vérifier JWT_SECRET
3. **Dashboard ne charge pas** : Vérifier les permissions utilisateur
4. **Page admin inaccessible** : Promouvoir l'utilisateur en admin

### Logs
- Backend : `npm start` affiche les logs serveur
- Frontend : Console du navigateur pour les erreurs React 