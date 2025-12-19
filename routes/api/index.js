import express from 'express';
const router = express.Router();

// Importer les routes API
import usersRouter from './users.js';
import coursesRouter from './courses.js';

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

export default router;

