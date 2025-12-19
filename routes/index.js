import express from 'express';
const router = express.Router();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from '../config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du site
export const WEBSITE_TITLE = 'TP_Express';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { 
    title: 'Accueil',
    website_title: WEBSITE_TITLE
  });
});

/* GET courses page (remplace "À propos"). */
router.get('/courses', function(req, res, next) {
  res.render('pages/courses', { 
    title: 'Mes cours',
    website_title: WEBSITE_TITLE
  });
});

/* GET about page (conservée pour compatibilité). */
router.get('/about', function(req, res, next) {
  res.redirect('/courses');
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('pages/contact', { 
    title: 'Contact',
    website_title: WEBSITE_TITLE
  });
});

/* POST contact form - Envoie les données au webhook Discord */
router.post('/contact', async function(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation basique
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }
    
    // URL du webhook Discord
    const webhookUrl = 'https://discord.com/api/webhooks/1451544073088405576/J5_YPCsoDn2rCikXZHR1XE0DUajr6OeDoCCR6QU-32ZKhWx_73rRSl3-F23vy_YYQGJB';
    
    // Créer l'embed Discord
    const embed = {
      title: '📧 Nouveau message de contact',
      color: 0x2563eb, // Couleur bleue
      fields: [
        {
          name: '👤 Nom',
          value: name,
          inline: true
        },
        {
          name: '📧 Email',
          value: email,
          inline: true
        },
        {
          name: '📌 Sujet',
          value: subject,
          inline: false
        },
        {
          name: '💬 Message',
          value: message.length > 1024 ? message.substring(0, 1021) + '...' : message,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Formulaire de contact - TP Express'
      }
    };
    
    // Envoyer au webhook Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur Discord: ${response.status}`);
    }
    
    // Succès
    res.json({
      success: true,
      message: 'Votre message a été envoyé avec succès !'
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.'
    });
  }
});

/* GET chat page. */
router.get('/chat', function(req, res, next) {
  res.render('pages/chat', { 
    title: 'Chat',
    website_title: WEBSITE_TITLE
  });
});

/* GET logs page. */
router.get('/logs', function(req, res, next) {
  // Lire les logs depuis le fichier si il existe
  const logPath = path.join(__dirname, '../log/latest-log.txt');
  let logs = '';
  
  try {
    if (fs.existsSync(logPath)) {
      logs = fs.readFileSync(logPath, 'utf8');
    }
  } catch (err) {
    console.error('Erreur lors de la lecture des logs:', err);
  }
  
  res.render('pages/logs', { 
    title: 'Logs',
    website_title: WEBSITE_TITLE,
    logs: logs
  });
});

/* GET download file. */
router.get('/download', function(req, res, next) {
  const imagePath = path.join(__dirname, '../public/images/dl.png');
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Fichier dl.png non trouvé');
  }
  
  // Empêcher la mise en cache pour garantir un nouveau nom à chaque clic
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Générer le nom de fichier avec la date/heure (actualisé à chaque clic)
  const now = new Date(); 
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  const fileName = year + month + day + '_' + hours + minutes + seconds + '_' + milliseconds + '.txt';
  
  // Télécharger le fichier avec le nouveau nom
  res.download(imagePath, fileName, function(err) {
    if (err) {
      console.error('Erreur lors du téléchargement:', err);
      if (!res.headersSent) {
        res.status(500).send('Erreur lors du téléchargement');
      }
    }
  });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  // Si déjà connecté, rediriger vers l'accueil
  if (req.user || req.session.user) {
    return res.redirect('/');
  }
  
  res.render('pages/login', { 
    title: 'Connexion',
    website_title: WEBSITE_TITLE
  });
});

/* GET auth/google - Démarre l'authentification Google OAuth */
router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/* GET auth/google/callback - Callback après authentification Google */
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Authentification réussie, sauvegarder dans la session
    req.session.user = {
      id: req.user.id,
      username: req.user.email,
      login: req.user.login || req.user.name,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    // Rediriger vers l'accueil
    res.redirect('/');
  }
);

/* POST login - traitement du formulaire. */
router.post('/login', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  
  // Vérifier les identifiants (admin/admin)
  if (username === 'admin' && password === 'admin') {
    // Créer la session
    req.session.user = {
      username: username,
      login: username
    };
    // Rediriger vers l'accueil
    res.redirect('/');
  } else {
    // Identifiants incorrects
    res.render('pages/login', { 
      title: 'Connexion',
      website_title: WEBSITE_TITLE,
      error: 'Nom d\'utilisateur ou mot de passe incorrect'
    });
  }
});

/* GET logout - déconnexion. */
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      console.error('Erreur lors de la déconnexion Passport:', err);
    }
    req.session.destroy(function(err) {
      if (err) {
        console.error('Erreur lors de la destruction de la session:', err);
    }
    res.redirect('/');
    });
  });
});

export default router;
