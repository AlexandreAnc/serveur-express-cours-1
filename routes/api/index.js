var express = require('express');
var router = express.Router();

// Importer les routes API
var usersRouter = require('./users');
var coursesRouter = require('./courses');

// Routes API
router.use('/users', usersRouter);
router.use('/courses', coursesRouter);

// Route de test pour vérifier que l'API fonctionne
router.get('/', function(req, res) {
  res.json({
    success: true,
    message: 'API RESTful fonctionnelle',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      courses: '/api/courses'
    }
  });
});

module.exports = router;

