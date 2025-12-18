var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var db = require('./database');

// Vérifier que les credentials Google sont configurés
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://tp-api-express.alexanc.fr/auth/google/callback'
  : 'http://localhost:8080/auth/google/callback');

// Log pour debug (sans afficher les secrets complets)
if (googleClientId) {
  console.log('✓ GOOGLE_CLIENT_ID configuré:', googleClientId.substring(0, 20) + '...');
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID non défini');
}

if (googleClientSecret) {
  console.log('✓ GOOGLE_CLIENT_SECRET configuré');
} else {
  console.warn('⚠️  GOOGLE_CLIENT_SECRET non défini');
}

console.log('✓ GOOGLE_CALLBACK_URL:', googleCallbackUrl);

if (!googleClientId || !googleClientSecret || googleClientId === 'VOTRE_CLIENT_ID' || googleClientSecret === 'VOTRE_CLIENT_SECRET') {
  console.error('✗ ERREUR: Les credentials Google OAuth ne sont pas configurés !');
  console.error('   Définissez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans vos variables d\'environnement.');
  console.error('   L\'authentification Google ne fonctionnera pas sans ces credentials.');
}

// Configuration Passport pour Google OAuth
passport.use(new GoogleStrategy({
    clientID: googleClientId || 'VOTRE_CLIENT_ID',
    clientSecret: googleClientSecret || 'VOTRE_CLIENT_SECRET',
    callbackURL: googleCallbackUrl
  },
  function(accessToken, refreshToken, profile, done) {
    // Cette fonction est appelée après l'authentification réussie avec Google
    // profile contient les informations de l'utilisateur Google
    
    try {
      // Vérifier si l'utilisateur existe déjà dans la base de données
      var stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      var user = stmt.get(profile.emails[0].value);
      
      if (user) {
        // Utilisateur existant, retourner les informations
        return done(null, {
          id: user.id,
          name: user.name || profile.displayName,
          email: user.email,
          login: profile.displayName,
          role: user.role || 'user',
          googleId: profile.id
        });
      } else {
        // Nouvel utilisateur, le créer dans la base de données
        var insertStmt = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)');
        var result = insertStmt.run(
          profile.displayName,
          profile.emails[0].value,
          'user'
        );
        
        // Récupérer l'utilisateur créé
        var selectStmt = db.prepare('SELECT * FROM users WHERE id = ?');
        var newUser = selectStmt.get(result.lastInsertRowid);
        
        return done(null, {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          login: profile.displayName,
          role: newUser.role || 'user',
          googleId: profile.id
        });
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

// Sérialiser l'utilisateur pour la session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Désérialiser l'utilisateur depuis la session
passport.deserializeUser(function(id, done) {
  try {
    var stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    var user = stmt.get(id);
    
    if (user) {
      done(null, {
        id: user.id,
        name: user.name,
        email: user.email,
        login: user.name,
        role: user.role || 'user'
      });
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

