# Serveur Express

Application web développée avec Express.js et EJS, incluant un système d'authentification par session et plusieurs pages fonctionnelles.

## 📋 Table des matières

- [Description](#description)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du projet](#structure-du-projet)
- [Routes disponibles](#routes-disponibles)
- [API RESTful](#api-restful)
- [Fonctionnalités](#fonctionnalités)
  - [Authentification OAuth avec Google](#authentification-oauth-avec-google)
  - [Chat en temps réel avec Socket.IO](#chat-en-temps-réel-avec-socketio)
  - [Filtrage des mots interdits](#filtrage-des-mots-interdits)
  - [Base de données : Sequelize ORM](#base-de-données-sequelize-orm)
  - [Architecture de l'API RESTful](#architecture-de-lapi-restful)
  - [Design responsive](#design-responsive)
  - [Améliorations front-end](#améliorations-front-end)
- [Technologies utilisées](#technologies-utilisées)
- [Déploiement](#déploiement)

## 📝 Description

Ce projet est une application web basée sur Express.js qui propose :
- Un système d'authentification par session
- Plusieurs pages statiques (accueil, mes cours, contact)
- Une page de visualisation des logs
- Un système de téléchargement de fichiers
- Un chat en temps réel avec WebSocket (Socket.IO)
- Une API RESTful pour interagir avec la base de données SQLite
- Une gestion d'erreurs personnalisée

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [npm](https://www.npmjs.com/) (généralement inclus avec Node.js)

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone <url-du-repo>
cd serveur-express
```

2. Installez les dépendances :
```bash
npm install
```

## ⚙️ Configuration

### Variables d'environnement

Le serveur utilise le fichier `.env` (chargé via `dotenv`) pour les variables d'environnement.

**Variables requises :**

- `PORT` : Port d'écoute du serveur (défaut : `8080`)

**Variables optionnelles (pour OAuth Google) :**

- `GOOGLE_CLIENT_ID` : ID client OAuth depuis Google Cloud Console
- `GOOGLE_CLIENT_SECRET` : Secret client OAuth
- `GOOGLE_CALLBACK_URL` : URL de callback (auto-configurée selon l'environnement)

**Exemple de fichier `.env` :**
```env
PORT=8080
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
```

⚠️ **Important** : 
- Le fichier `.env` ne doit **jamais** être commité dans Git (déjà dans `.gitignore`)
- Le secret de session dans `app.js` doit être modifié en production pour des raisons de sécurité

## ▶️ Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur sera accessible sur `http://localhost:8080` (ou le port configuré).

## 📁 Structure du projet

```
serveur-express/
├── bin/
│   └── www                 # Point d'entrée du serveur (initialise Socket.IO)
├── config/
│   ├── sequelize.js        # Configuration Sequelize ORM (connexion SQLite)
│   └── database.js         # Configuration better-sqlite3 (déprécié)
├── models/                 # Modèles Sequelize
│   ├── User.js            # Modèle User
│   ├── Course.js          # Modèle Course
│   └── Message.js         # Modèle Message
├── routes/                  # Routes de l'application
│   ├── index.js           # Routes principales (pages web)
│   ├── users.js           # Routes utilisateurs
│   └── api/               # Routes API RESTful
│       ├── index.js       # Routeur API principal
│       ├── users.js       # Endpoints API pour les utilisateurs
│       └── courses.js     # Endpoints API pour les cours
├── socket/                 # Configuration Socket.IO
│   └── socket.js          # Gestion des événements WebSocket
├── utils/                  # Utilitaires
│   ├── logger.js          # Système de logging
│   └── wordFilter.js      # Filtrage des mots interdits
├── public/                 # Fichiers statiques
│   ├── images/            # Images (favicon, dl.png)
│   ├── javascripts/       # Scripts JavaScript
│   │   └── socket-client.js
│   └── stylesheets/       # Feuilles de style CSS
├── views/                  # Templates EJS
│   ├── layout/           # Layouts réutilisables
│   │   ├── footer.ejs
│   │   ├── head.ejs
│   │   └── header.ejs
│   └── pages/            # Pages de l'application
│       ├── about.ejs
│       ├── chat.ejs      # Page de chat en temps réel
│       ├── contact.ejs
│       ├── courses.ejs   # Page "Mes cours"
│       ├── error.ejs
│       ├── index.ejs
│       ├── login.ejs
│       └── logs.ejs
├── .github/
│   └── workflows/
│       └── deploy.yml    # Workflow GitHub Actions pour le déploiement
├── app.js                 # Configuration Express principale
├── package.json           # Dépendances et scripts
└── README.md             # Ce fichier
```

## 🛣️ Routes disponibles

### Routes publiques

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Page d'accueil |
| `GET` | `/courses` | Page "Mes cours" (affiche les cours disponibles) |
| `GET` | `/about` | Redirige vers `/courses` |
| `GET` | `/contact` | Page de contact |
| `GET` | `/chat` | Page de chat en temps réel |
| `GET` | `/login` | Page de connexion |
| `POST` | `/login` | Traitement du formulaire de connexion |
| `GET` | `/download` | Téléchargement du fichier `dl.png` avec un nom unique basé sur la date/heure |
| `GET` | `/logs` | Affichage des logs depuis `log/latest-log.txt` |

### Routes protégées

| Méthode | Route | Description | Authentification requise |
|---------|-------|-------------|-------------------------|
| `GET` | `/logout` | Déconnexion et destruction de la session | Non (accessible à tous) |

### Routes utilisateurs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/users` | Liste des utilisateurs (route de base) |

### Gestion des erreurs

- **404** : Page non trouvée (redirection vers la page d'erreur)
- **500** : Erreur serveur (affichage des détails en mode développement uniquement)

## 🔌 API RESTful

L'application expose une API RESTful complète pour interagir avec la base de données SQLite. Toutes les réponses sont au format JSON.

### Base URL

```
http://localhost:8080/api
```

### Format des réponses

**Succès :**
```json
{
  "success": true,
  "data": { ... },
  "count": 1
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Message d'erreur"
}
```

### Endpoints disponibles

#### 👥 Utilisateurs (`/api/users`)

##### GET `/api/users`
Récupère tous les utilisateurs de la base de données.

**Exemple de requête :**
```bash
curl http://localhost:8080/api/users
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Marc Dev",
      "email": "marc@dev.com",
      "role": "instructor"
    }
  ],
  "count": 1
}
```

##### GET `/api/users/:id`
Récupère un utilisateur par son ID.

**Exemple de requête :**
```bash
curl http://localhost:8080/api/users/1
```

##### POST `/api/users`
Crée un nouvel utilisateur.

**Exemple de requête :**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Nouvel User","email":"user@example.com","role":"student"}'
```

##### PUT `/api/users/:id`
Met à jour un utilisateur existant.

**Exemple de requête :**
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Nom Modifié","role":"admin"}'
```

##### DELETE `/api/users/:id`
Supprime un utilisateur.

**Exemple de requête :**
```bash
curl -X DELETE http://localhost:8080/api/users/1
```

#### 📚 Cours (`/api/courses`)

##### GET `/api/courses`
Récupère tous les cours avec leurs instructeurs.

**Exemple de requête :**
```bash
curl http://localhost:8080/api/courses
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Masterclass Node.js",
      "price": 49.99,
      "instructor_id": 1,
      "instructor": {
        "id": 1,
        "name": "Marc Dev",
        "email": "marc@dev.com"
      }
    }
  ],
  "count": 1
}
```

##### GET `/api/courses/:id`
Récupère un cours par son ID avec son instructeur.

**Exemple de requête :**
```bash
curl http://localhost:8080/api/courses/1
```

##### POST `/api/courses`
Crée un nouveau cours.

**Exemple de requête :**
```bash
curl -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Nouveau Cours","price":29.99,"instructor_id":1}'
```

##### PUT `/api/courses/:id`
Met à jour un cours existant.

**Exemple de requête :**
```bash
curl -X PUT http://localhost:8080/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"price":39.99}'
```

##### DELETE `/api/courses/:id`
Supprime un cours.

**Exemple de requête :**
```bash
curl -X DELETE http://localhost:8080/api/courses/1
```

## ✨ Fonctionnalités

### Authentification

- **Connexion** : Identifiants par défaut `admin` / `admin`
- **Session** : Gestion des sessions avec `express-session`
- **Déconnexion** : Destruction de la session et redirection vers l'accueil
- **Protection** : Les informations de session sont disponibles dans toutes les vues via `res.locals`

#### Authentification OAuth avec Google

L'application intègre **Passport.js** avec la stratégie **Google OAuth 2.0** (`passport-google-oauth20`) pour permettre aux utilisateurs de se connecter avec leur compte Google.

**Mise en place technique :**

1. **Configuration Passport** (`config/passport.js`) :
   - Utilisation de la `GoogleStrategy` de Passport.js
   - Variables d'environnement requises :
     - `GOOGLE_CLIENT_ID` : ID client OAuth depuis Google Cloud Console
     - `GOOGLE_CLIENT_SECRET` : Secret client OAuth
     - `GOOGLE_CALLBACK_URL` : URL de callback (auto-configurée selon l'environnement)
   - **Sérialisation/Désérialisation** : Les utilisateurs sont sérialisés dans la session via `passport.serializeUser()` et `passport.deserializeUser()`
   - **Création automatique** : Si un utilisateur Google n'existe pas dans la base, il est automatiquement créé dans la table `users`

2. **Routes OAuth** (`routes/index.js`) :
   - `GET /auth/google` : Démarre le flux OAuth (redirige vers Google)
   - `GET /auth/google/callback` : Callback après authentification Google, sauvegarde dans `req.session.user`

3. **Intégration Express** (`app.js`) :
   - `passport.initialize()` : Initialise Passport
   - `passport.session()` : Active la gestion de session Passport
   - Middleware pour passer `req.user` et `isAuthenticated` aux vues via `res.locals`

**Flux d'authentification :**
```
Utilisateur clique sur "Se connecter avec Google"
    ↓
GET /auth/google → passport.authenticate('google')
    ↓
Redirection vers Google (consentement)
    ↓
Google redirige vers /auth/google/callback
    ↓
Passport vérifie/crée l'utilisateur dans la DB
    ↓
Session créée → Redirection vers /
```

### Chat en temps réel avec Socket.IO

L'application intègre un système de chat en temps réel utilisant **Socket.IO** (basé sur **WebSocket**).

**Architecture technique :**

1. **Initialisation (`bin/www`) :**
   - Socket.IO est initialisé sur le serveur HTTP Express
   - Configuration pour fonctionner derrière un reverse proxy (Nginx) :
     - `transports: ['polling']` : Force l'utilisation du polling HTTP long-polling (plus stable que WebSocket pur derrière Nginx)
     - `allowUpgrades: false` : Empêche la mise à niveau vers WebSocket
     - `path: '/socket.io/'` : Chemin personnalisé pour Socket.IO
     - `cors` : Configuration CORS pour autoriser les connexions cross-origin

2. **Configuration serveur** (`socket/socket.js`) :
   - **Événements gérés** :
     - `connection` : Nouvelle connexion Socket.IO
     - `join-chat` : Utilisateur rejoint le chat avec un pseudo
     - `chat-message` : Réception d'un message
     - `typing` / `stop-typing` : Indicateur de frappe en temps réel
     - `disconnect` : Déconnexion d'un utilisateur
   - **Gestion des utilisateurs** :
     - `connectedUsers` : Objet stockant les utilisateurs connectés (socketId → pseudo)
     - `pseudoToSocketId` : Mapping pseudo → socketId pour éviter les doublons
     - `cleanupUser()` : Fonction de nettoyage pour gérer les rafraîchissements rapides
   - **Rate limiting** : Protection anti-spam
     - Maximum 5 messages par fenêtre de 10 secondes
     - Stockage des timestamps dans `socket.messageTimestamps`
   - **Historique des messages** :
     - Sauvegarde des 5 derniers messages dans la table `messages` via Sequelize
     - Chargement automatique à la connexion via `Message.findAll()` avec limite
     - Fonction `saveMessage(pseudo, message, timestamp)` utilisant `Message.create()` pour la persistance

3. **Client Socket.IO** (`public/javascripts/socket-client.js` + `views/pages/chat.ejs`) :
   - Connexion automatique au serveur Socket.IO
   - Écoute des événements : `new-message`, `user-joined`, `user-count`, `typing-users`, `chat-history`
   - Gestion de la déconnexion : `beforeunload`, `unload`, `pagehide` pour nettoyer proprement les connexions
   - Protection XSS : Utilisation de `createElement` et `textContent` au lieu de `innerHTML`

**Fonctionnalités du chat :**
- **Pseudo personnalisé** : Stocké dans `localStorage` pour persister entre les sessions
- **Indicateur de frappe** : Affichage dynamique ("X est en train d'écrire", "X, Y sont en train d'écrire", "Plusieurs personnes sont en train d'écrire")
- **Compteur d'utilisateurs** : Affichage du nombre d'utilisateurs connectés en temps réel
- **Filtrage des mots interdits** : Voir section dédiée ci-dessous
- **Historique** : Les 5 derniers messages sont chargés automatiquement

### Filtrage des mots interdits

Le système de chat intègre un filtre de contenu pour censurer les mots inappropriés.

**Mise en place technique :**

1. **Bibliothèque** : `badwords-list`
   - Fournit une liste de mots interdits en anglais

2. **Module de filtrage** (`utils/wordFilter.js`) :
   - `filterMessage(message)` : Remplace les mots interdits par des astérisques (`*****`)
   - `isProfane(message)` : Vérifie si un message contient des mots interdits
   - Liste étendue avec des mots français supplémentaires
   - Utilisation de regex pour détecter les variations (avec/sans accents, majuscules/minuscules)

3. **Intégration** (`socket/socket.js`) :
   - Les messages sont filtrés avant d'être diffusés via `wordFilter.filterMessage(message)`
   - Les messages filtrés sont sauvegardés dans l'historique

### Base de données : Sequelize ORM

L'application utilise **Sequelize** comme ORM (Object-Relational Mapping) pour interagir avec la base de données SQLite.

**Mise en place technique :**

1. **Configuration** (`config/sequelize.js`) :
   - Connexion à la base SQLite (`mds_b3dev_api_dev.db3`)
   - **Timestamps désactivés** : `timestamps: false` (la base existante n'utilise pas de timestamps automatiques)
   - **Noms de tables figés** : `freezeTableName: true` pour utiliser les noms de tables existants

2. **Modèles Sequelize** (`models/`) :
   - **User** (`models/User.js`) : Modèle pour la table `users` (id, name, email, role)
   - **Course** (`models/Course.js`) : Modèle pour la table `courses` (id, title, price, instructor_id)
   - **Message** (`models/Message.js`) : Modèle pour la table `messages` (id, pseudo, message, timestamp)

3. **Relations** :
   - `Course.belongsTo(User)` : Un cours appartient à un instructeur (User)
   - `User.hasMany(Course)` : Un utilisateur peut avoir plusieurs cours
   - Relations définies avec `foreignKey: 'instructor_id'` et `as: 'instructor'`

4. **Avantages de Sequelize** :
   - **Abstraction SQL** : Pas besoin d'écrire du SQL brut
   - **Protection injection SQL** : Requêtes préparées automatiquement
   - **Relations automatiques** : Gestion des JOINs via `include`
   - **Validation** : Validation des données avant insertion
   - **Async/Await** : Support natif des Promises

5. **Tables utilisées** :
   - `users` : Utilisateurs (id, name, email, role)
   - `courses` : Cours (id, title, price, instructor_id)
   - `messages` : Messages du chat (id, pseudo, message, timestamp)

### Architecture de l'API RESTful

L'application expose une API RESTful complète pour interagir avec la base de données. Voir la section [API RESTful](#api-restful) pour les détails des endpoints et exemples de requêtes.

**Architecture technique :**

1. **Routeur API** (`routes/api/index.js`) :
   - Montage des routes sous `/api`
   - Routes utilisateurs : `/api/users`
   - Routes cours : `/api/courses`

2. **Endpoints utilisateurs** (`routes/api/users.js`) :
   - `GET /api/users` : Liste tous les utilisateurs
   - `GET /api/users/:id` : Récupère un utilisateur par ID
   - `POST /api/users` : Crée un utilisateur
   - `PUT /api/users/:id` : Met à jour un utilisateur
   - `DELETE /api/users/:id` : Supprime un utilisateur
   - **Sécurité** : Le champ `password` est exclu des réponses

3. **Endpoints cours** (`routes/api/courses.js`) :
   - `GET /api/courses` : Liste tous les cours avec leurs instructeurs (via Sequelize `include`)
   - `GET /api/courses/:id` : Récupère un cours avec son instructeur
   - `POST /api/courses` : Crée un cours
   - `PUT /api/courses/:id` : Met à jour un cours
   - `DELETE /api/courses/:id` : Supprime un cours
   - **Relations** : Utilisation de Sequelize `include` pour récupérer les données de l'instructeur

4. **Format des réponses** :
   - Succès : `{ "success": true, "data": {...}, "count": 1 }`
   - Erreur : `{ "success": false, "message": "..." }`

5. **CORS** : Middleware CORS activé pour permettre les requêtes cross-origin depuis le frontend

### Design responsive

L'application est entièrement responsive avec un design adaptatif pour mobile, tablette et desktop.

**Mise en place technique :**

1. **Menu hamburger** (`views/layout/header.ejs`) :
   - Bouton hamburger visible uniquement sur mobile (`@media (max-width: 768px)`)
   - Menu de navigation qui se transforme en colonne sur mobile
   - JavaScript pour gérer l'ouverture/fermeture du menu
   - Fermeture automatique au clic sur un lien

2. **Breakpoints CSS** :
   - **768px** : Tablettes (menu hamburger, layout en colonne)
   - **480px** : Téléphones (tailles de police réduites, padding ajusté)

3. **Pages adaptatives** :
   - **Accueil** : Hero section et grille de features responsive
   - **Contact** : Formulaire adaptatif
   - **Cours** : Cartes en colonne unique sur mobile
   - **Chat** : Interface adaptée aux petits écrans (header en colonne, messages plus compacts)

4. **CSS Grid et Flexbox** :
   - Utilisation de `grid-template-columns: repeat(auto-fit, minmax(...))` pour les grilles adaptatives
   - Flexbox pour les layouts flexibles

### Améliorations front-end

Plusieurs améliorations visuelles ont été apportées au site :

1. **Page d'accueil** (`views/pages/index.ejs`) :
   - Hero section avec gradient bleu
   - Boutons d'action vers les cours et le contact
   - Section "Pourquoi nous choisir ?" avec 3 cartes de fonctionnalités

2. **Page contact** (`views/pages/contact.ejs`) :
   - Formulaire de contact stylisé (non fonctionnel, design uniquement)
   - Champs : Nom, Email, Sujet, Message
   - Design cohérent avec le reste du site

3. **Page cours** (`views/pages/courses.ejs`) :
   - Cartes de cours améliorées avec :
     - Images aléatoires via **Picsum Photos API** (`https://picsum.photos/seed/{id}/400/250`)
     - Descriptions pour chaque cours
     - Design moderne avec ombres et transitions

4. **Page 404** (`views/pages/error.ejs`) :
   - Bouton "Retour à l'accueil" avec la même couleur que les autres boutons (`#2563eb`)

### Téléchargement de fichiers

La route `/download` permet de télécharger le fichier `dl.png` avec un nom de fichier unique généré automatiquement basé sur la date et l'heure actuelle :
- Format : `YYYYMMDD_HHMMSS_mmm.txt`
- Exemple : `20240115_143022_456.txt`
- Le cache est désactivé pour garantir un nouveau nom à chaque téléchargement

### Visualisation des logs

La page `/logs` affiche le contenu du fichier `log/latest-log.txt` s'il existe. Si le fichier n'existe pas, une page vide est affichée.

**Fonctionnalité ajoutée** : Scroll automatique vers le bas pour afficher les logs les plus récents au chargement de la page.

### Gestion des erreurs

- Page d'erreur personnalisée (`views/pages/error.ejs`)
- Affichage des détails d'erreur uniquement en mode développement
- Gestion des erreurs 404 et 500

## 🛠️ Technologies utilisées

### Backend

- **Node.js** : Environnement d'exécution JavaScript côté serveur. Node.js n'est pas un serveur web en soi, mais un runtime qui permet d'exécuter du JavaScript en dehors du navigateur. Il utilise le moteur V8 de Chrome et permet de créer des applications serveur performantes grâce à son modèle asynchrone basé sur les événements.
- **Express.js** : Framework web minimaliste et flexible pour Node.js, facilitant la création d'applications web et d'APIs
- **Socket.IO** : Bibliothèque pour la communication en temps réel via WebSocket. Utilise le protocole WebSocket avec fallback sur HTTP long-polling pour une compatibilité maximale.
- **Sequelize** : ORM (Object-Relational Mapping) pour Node.js. Permet d'interagir avec la base de données SQLite via des modèles JavaScript plutôt que du SQL brut. Gère automatiquement les relations, les validations et la protection contre les injections SQL.
- **sqlite3** : Driver SQLite asynchrone pour Node.js (requis par Sequelize)
- **SQLite** : Base de données relationnelle légère stockée dans un fichier (`.db3`)
- **express-session** : Middleware pour la gestion des sessions utilisateur (cookies, stockage en mémoire)
- **Passport.js** : Middleware d'authentification flexible pour Node.js
- **passport-google-oauth20** : Stratégie Passport pour l'authentification OAuth 2.0 avec Google
- **dotenv** : Chargement des variables d'environnement depuis un fichier `.env`
- **morgan** : Middleware de logging HTTP (format de logs des requêtes)
- **cookie-parser** : Parseur de cookies pour Express
- **http-errors** : Création d'erreurs HTTP standardisées
- **CORS** : Middleware pour gérer les requêtes Cross-Origin Resource Sharing (nécessaire pour l'API)

### Frontend

- **EJS** : Moteur de template pour générer des vues HTML dynamiques. Permet d'inclure des layouts (`<%- include() %>`) et d'injecter des variables (`<%= variable %>`)
- **CSS3** : Styles modernes avec Flexbox, Grid, et Media Queries pour le responsive design

### Outils de développement

- **nodemon** : Outil de développement pour le rechargement automatique du serveur lors des modifications de code

### Sécurité et contenu

- **badwords-list** : Bibliothèque fournissant une liste de mots interdits pour le filtrage de contenu dans le chat

## 🚀 Déploiement

### Architecture de déploiement

Ce projet est déployé en production avec la stack suivante :
- **Node.js** : Environnement d'exécution JavaScript qui exécute l'application Express.js
- **Express.js** : Framework web qui crée un serveur HTTP et gère les routes
- **NGINX** : Serveur web et reverse proxy qui fait le lien entre Internet et l'application Node.js
- **PM2** : Process Manager pour gérer le processus Node.js en production
- **GitHub Actions** : Automatisation du déploiement via CI/CD
- **VPS** : Serveur distant où l'application est hébergée

### Node.js : Environnement d'exécution JavaScript

**Node.js n'est pas un serveur web**, mais un environnement d'exécution JavaScript (runtime) qui permet d'exécuter du JavaScript côté serveur. Dans ce projet :
- **Node.js** exécute le code JavaScript de l'application
- **Express.js** crée un serveur HTTP qui écoute sur un port (8080 par défaut en interne)
- Le serveur Express gère les requêtes HTTP (GET, POST, PUT, DELETE)
- Node.js gère les opérations asynchrones et les connexions simultanées efficacement grâce à son modèle événementiel

### NGINX : Reverse Proxy

**NGINX** est utilisé comme reverse proxy et serveur web en production :
- **Reverse Proxy** : NGINX reçoit les requêtes HTTP/HTTPS depuis Internet (port 80/443) et les redirige vers l'application Node.js qui tourne en interne (port 8080)
- **SSL/TLS** : NGINX gère les certificats HTTPS (SSL/TLS) pour sécuriser les connexions
- **Load Balancing** : Peut répartir la charge entre plusieurs instances de l'application
- **Static Files** : Peut servir directement les fichiers statiques (CSS, JS, images) sans passer par Node.js
- **WebSocket Support** : Configuration spéciale pour proxy les connexions Socket.IO (HTTP long-polling dans ce projet)

**Architecture réseau :**
```
Internet → NGINX (port 80/443) → Node.js/Express (port 8080)
```

### Process Manager : PM2

PM2 (Process Manager 2) est utilisé pour :
- **Gérer le processus** : Démarrer, arrêter, redémarrer l'application
- **Surveillance** : Monitoring de l'état de l'application
- **Redémarrage automatique** : Relance l'application en cas de crash
- **Gestion des logs** : Centralisation des logs de l'application

**Commandes PM2 utiles :**
```bash
pm2 start ./bin/www --name serveur-express-cours-1
pm2 reload serveur-express-cours-1
pm2 stop serveur-express-cours-1
pm2 list
pm2 logs
pm2 save
```

### Déploiement avec GitHub Actions

Le déploiement est automatisé via GitHub Actions. Le workflow (`.github/workflows/deploy.yml`) :

1. **Déclenchement** : Se déclenche automatiquement lors d'un push sur la branche `main`
2. **Connexion SSH** : Se connecte au serveur VPS via SSH
3. **Mise à jour du code** : Exécute `git pull` pour récupérer les dernières modifications
4. **Installation des dépendances** : Lance `npm ci --omit=dev` pour installer les dépendances de production
5. **Redémarrage de l'application** : Utilise PM2 pour recharger l'application avec les nouvelles modifications

**Configuration requise (secrets GitHub) :**
- `SSH_HOST` : Adresse IP ou domaine du serveur
- `SSH_USER` : Nom d'utilisateur SSH
- `SSH_KEY` : Clé privée SSH pour l'authentification
- `APP_DIR` : Chemin du répertoire de l'application sur le serveur

### Workflow de déploiement

```
Développeur push sur main
    ↓
GitHub Actions se déclenche
    ↓
Connexion SSH au VPS
    ↓
git pull (récupération du code)
    ↓
npm ci (installation dépendances)
    ↓
pm2 reload (redémarrage de l'application)
    ↓
Application déployée et accessible
```

## 📝 Notes

- Le secret de session doit être modifié en production (voir `app.js` ligne 25)
- Le port par défaut est `8080` mais peut être modifié via la variable d'environnement `PORT`
- Les logs sont lus depuis `log/latest-log.txt` (assurez-vous que ce fichier existe ou créez-le si nécessaire)
- La base de données SQLite est stockée dans `mds_b3dev_api_dev.db3`

Ce projet est un travail fait en cours.

