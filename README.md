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

Le serveur utilise le port défini dans la variable d'environnement `PORT`, ou le port `8080` par défaut.

Pour définir un port personnalisé :
```bash
export PORT=3000
```

### Configuration de la session

⚠️ **Important** : Le secret de session dans `app.js` doit être modifié en production pour des raisons de sécurité.

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
│   └── database.js         # Configuration better-sqlite3 (connexion SQLite)
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

### Téléchargement de fichiers

La route `/download` permet de télécharger le fichier `dl.png` avec un nom de fichier unique généré automatiquement basé sur la date et l'heure actuelle :
- Format : `YYYYMMDD_HHMMSS_mmm.txt`
- Exemple : `20240115_143022_456.txt`
- Le cache est désactivé pour garantir un nouveau nom à chaque téléchargement

### Visualisation des logs

La page `/logs` affiche le contenu du fichier `log/latest-log.txt` s'il existe. Si le fichier n'existe pas, une page vide est affichée.

### Gestion des erreurs

- Page d'erreur personnalisée (`views/pages/error.ejs`)
- Affichage des détails d'erreur uniquement en mode développement
- Gestion des erreurs 404 et 500

## 🛠️ Technologies utilisées

- **Node.js** : Environnement d'exécution JavaScript côté serveur. Node.js permet d'utiliser JavaScript pour créer des serveurs web performants et asynchrones.
- **Express.js** : Framework web minimaliste et flexible pour Node.js, facilitant la création d'applications web et d'APIs
- **EJS** : Moteur de template pour générer des vues HTML dynamiques
- **Socket.IO** : Bibliothèque pour la communication en temps réel via WebSocket
- **better-sqlite3** : Driver SQLite performant et synchrone pour Node.js
- **SQLite** : Base de données relationnelle légère stockée dans un fichier
- **express-session** : Gestion des sessions utilisateur
- **morgan** : Middleware de logging HTTP
- **cookie-parser** : Parseur de cookies
- **http-errors** : Création d'erreurs HTTP
- **nodemon** : Rechargement automatique en développement
- **CORS** : Support des requêtes cross-origin pour l'API
- **badwords-list** : Liste de mots interdits pour le filtrage de contenu dans le chat

## 🚀 Déploiement

### Architecture de déploiement

Ce projet est déployé en production avec la stack suivante :
- **Node.js** : Serveur web qui exécute l'application Express.js
- **PM2** : Process Manager pour gérer le processus Node.js en production
- **GitHub Actions** : Automatisation du déploiement via CI/CD
- **VPS** : Serveur distant où l'application est hébergée

### Node.js comme serveur web

Node.js n'est pas un serveur web en soi, mais un environnement d'exécution JavaScript qui permet de créer des serveurs web. Dans ce projet :
- Express.js crée un serveur HTTP qui écoute sur un port (8080 par défaut)
- Le serveur gère les requêtes HTTP (GET, POST, PUT, DELETE)
- Node.js gère les opérations asynchrones et les connexions simultanées efficacement

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

