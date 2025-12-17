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
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)

## 📝 Description

Ce projet est une application web basée sur Express.js qui propose :
- Un système d'authentification par session
- Plusieurs pages statiques (accueil, à propos, contact)
- Une page de visualisation des logs
- Un système de téléchargement de fichiers
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
│   └── www                 # Point d'entrée du serveur
├── public/                 # Fichiers statiques
│   ├── images/            # Images (favicon, dl.png)
│   ├── javascripts/       # Scripts JavaScript
│   └── stylesheets/       # Feuilles de style CSS
├── routes/                 # Routes de l'application
│   ├── index.js          # Routes principales
│   └── users.js          # Routes utilisateurs
├── views/                 # Templates EJS
│   ├── layout/           # Layouts réutilisables
│   │   ├── footer.ejs
│   │   ├── head.ejs
│   │   └── header.ejs
│   └── pages/            # Pages de l'application
│       ├── about.ejs
│       ├── contact.ejs
│       ├── error.ejs
│       ├── index.ejs
│       ├── login.ejs
│       └── logs.ejs
├── app.js                 # Configuration Express principale
├── package.json           # Dépendances et scripts
└── README.md             # Ce fichier
```

## 🛣️ Routes disponibles

### Routes publiques

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Page d'accueil |
| `GET` | `/about` | Page "À propos" |
| `GET` | `/contact` | Page de contact |
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

- **Express.js** : Framework web pour Node.js
- **EJS** : Moteur de template pour générer des vues HTML
- **express-session** : Gestion des sessions utilisateur
- **morgan** : Middleware de logging HTTP
- **cookie-parser** : Parseur de cookies
- **http-errors** : Création d'erreurs HTTP
- **nodemon** : Rechargement automatique en développement

## 📝 Notes

- Le secret de session doit être modifié en production (voir `app.js` ligne 25)
- Le port par défaut est `8080` mais peut être modifié via la variable d'environnement `PORT`
- Les logs sont lus depuis `log/latest-log.txt` (assurez-vous que ce fichier existe ou créez-le si nécessaire)


Ce projet est un travail fait en cours.

