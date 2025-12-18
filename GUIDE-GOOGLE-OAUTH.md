# Guide : Obtenir les credentials Google OAuth

## Étape 1 : Accéder à Google Cloud Console

1. Allez sur **https://console.cloud.google.com/**
2. Connectez-vous avec votre compte Google

## Étape 2 : Créer un nouveau projet (ou utiliser un existant)

1. En haut à gauche, cliquez sur le sélecteur de projet (à côté de "Google Cloud")
2. Cliquez sur **"NEW PROJECT"** (Nouveau projet)
3. Donnez un nom à votre projet (ex: "Mon Site Express")
4. Cliquez sur **"CREATE"** (Créer)
5. Attendez quelques secondes que le projet soit créé
6. Sélectionnez le projet dans le sélecteur en haut

## Étape 3 : Activer l'API Google Identity

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Library"** (Bibliothèque)
2. Dans la barre de recherche, tapez **"Google Identity"** ou **"Google+ API"**
3. Cliquez sur **"Google Identity"** ou **"Google+ API"**
4. Cliquez sur le bouton **"ENABLE"** (Activer)
5. Attendez quelques secondes que l'API soit activée

## Étape 4 : Configurer l'écran de consentement OAuth

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"OAuth consent screen"** (Écran de consentement OAuth)
2. Sélectionnez **"External"** (Externe) et cliquez sur **"CREATE"**
3. Remplissez le formulaire :
   - **App name** (Nom de l'application) : "Mon Site Express" (ou ce que vous voulez)
   - **User support email** (Email de support) : Votre email
   - **Developer contact information** (Contact développeur) : Votre email
4. Cliquez sur **"SAVE AND CONTINUE"** (Enregistrer et continuer)
5. Sur la page "Scopes" (Portées), cliquez sur **"SAVE AND CONTINUE"** (pas besoin de modifier)
6. Sur la page "Test users" (Utilisateurs de test), cliquez sur **"SAVE AND CONTINUE"** (pas besoin de modifier pour l'instant)
7. Sur la page "Summary" (Résumé), cliquez sur **"BACK TO DASHBOARD"** (Retour au tableau de bord)

## Étape 5 : Créer les identifiants OAuth

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Credentials"** (Identifiants)
2. En haut de la page, cliquez sur **"+ CREATE CREDENTIALS"** (Créer des identifiants)
3. Sélectionnez **"OAuth client ID"** (ID client OAuth)
4. Si c'est la première fois, sélectionnez **"Web application"** comme type d'application
5. Donnez un nom à votre client OAuth (ex: "Mon Site Express Web Client")
6. Dans **"Authorized JavaScript origins"** (Origines JavaScript autorisées), ajoutez :
   - `http://localhost:8080` (pour le développement)
   - `https://tp-api-express.alexanc.fr` (pour la production)
7. Dans **"Authorized redirect URIs"** (URI de redirection autorisés), ajoutez :
   - `http://localhost:8080/auth/google/callback` (pour le développement)
   - `https://tp-api-express.alexanc.fr/auth/google/callback` (pour la production)
8. Cliquez sur **"CREATE"** (Créer)

## Étape 6 : Récupérer vos credentials

Après avoir créé le client OAuth, une popup s'affichera avec :
- **Your Client ID** (Votre ID client) : quelque chose comme `123456789-abc123def456.apps.googleusercontent.com`
- **Your Client Secret** (Votre secret client) : quelque chose comme `GOCSPX-abc123def456`

⚠️ **IMPORTANT** : Copiez ces deux valeurs immédiatement ! Le secret ne sera plus affiché après.

## Étape 7 : Configurer dans votre projet

### Option A : Utiliser dotenv (Recommandé)

1. Installez dotenv :
```bash
npm install dotenv
```

2. Créez un fichier `.env` à la racine du projet :
```bash
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
```

3. Ajoutez `.env` dans votre `.gitignore` pour ne pas commiter vos secrets

4. Modifiez `app.js` pour charger dotenv au début :
```javascript
require('dotenv').config();
```

### Option B : Variables d'environnement système

Sur votre serveur, définissez :
```bash
export GOOGLE_CLIENT_ID="votre_client_id"
export GOOGLE_CLIENT_SECRET="votre_client_secret"
export GOOGLE_CALLBACK_URL="https://tp-api-express.alexanc.fr/auth/google/callback"
```

## Étape 8 : Tester

1. Redémarrez votre serveur
2. Allez sur `/login`
3. Cliquez sur "Se connecter avec Google"
4. Vous devriez être redirigé vers Google pour vous connecter

## Dépannage

### Erreur "invalid_client"
- Vérifiez que les credentials sont correctement copiés (pas d'espaces)
- Vérifiez que les variables d'environnement sont bien chargées
- Redémarrez le serveur après avoir modifié les variables

### Erreur "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans Google Cloud Console correspond exactement à celui dans votre code
- Les URLs doivent être identiques (http vs https, avec ou sans slash final)

### L'API n'est pas activée
- Retournez dans "APIs & Services" → "Library"
- Cherchez "Google Identity" et activez-la

## Notes importantes

- En mode "Testing" (Test), seuls les utilisateurs ajoutés dans "Test users" peuvent se connecter
- Pour la production, vous devrez publier l'application dans l'écran de consentement OAuth
- Ne partagez jamais vos credentials publiquement (ne les commitez pas dans Git)

