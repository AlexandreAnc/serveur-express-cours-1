var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Configuration du site
var WEBSITE_TITLE = 'Site bien!';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', { 
    title: 'Accueil',
    website_title: WEBSITE_TITLE
  });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('pages/about', { 
    title: 'À Propos',
    website_title: WEBSITE_TITLE
  });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('pages/contact', { 
    title: 'Contact',
    website_title: WEBSITE_TITLE
  });
});

/* GET logs page. */
router.get('/logs', function(req, res, next) {
  // Lire les logs depuis le fichier si il existe
  var logPath = path.join(__dirname, '../log/latest-log.txt');
  var logs = '';
  
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
  var imagePath = path.join(__dirname, '../public/images/dl.png');
  
  // Vérifier si le fichier existe
  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Fichier dl.png non trouvé');
  }
  
  // Empêcher la mise en cache pour garantir un nouveau nom à chaque clic
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Générer le nom de fichier avec la date/heure (actualisé à chaque clic)
  var now = new Date(); 
  var year = now.getFullYear();
  var month = String(now.getMonth() + 1).padStart(2, '0');
  var day = String(now.getDate()).padStart(2, '0');
  var hours = String(now.getHours()).padStart(2, '0');
  var minutes = String(now.getMinutes()).padStart(2, '0');
  var seconds = String(now.getSeconds()).padStart(2, '0');
  var milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  var fileName = year + month + day + '_' + hours + minutes + seconds + '_' + milliseconds + '.txt';
  
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
  if (req.session.user) {
    return res.redirect('/');
  }
  
  res.render('pages/login', { 
    title: 'Connexion',
    website_title: WEBSITE_TITLE
  });
});

/* POST login - traitement du formulaire. */
router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  
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
  req.session.destroy(function(err) {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
module.exports.WEBSITE_TITLE = WEBSITE_TITLE;
