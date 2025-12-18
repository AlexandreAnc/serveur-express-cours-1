var express = require('express');
var router = express.Router();
var User = require('../../models/User');

/**
 * GET /api/users
 * Récupère tous les utilisateurs
 */
router.get('/', async function(req, res, next) {
  try {
    var users = await User.findAll();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Récupère un utilisateur par son ID
 */
router.get('/:id', async function(req, res, next) {
  try {
    var user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users
 * Crée un nouvel utilisateur
 */
router.post('/', async function(req, res, next) {
  try {
    var { name, email, role } = req.body;
    
    // Validation basique
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }
    
    // Vérifier si l'email existe déjà (unique)
    if (email) {
      var existingUser = await User.findOne({ where: { email: email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email existe déjà'
        });
      }
    }
    
    // Créer l'utilisateur
    var user = await User.create({
      name: name,
      email: email || null,
      role: role || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors.map(e => e.message)
      });
    }
    next(error);
  }
});

/**
 * PUT /api/users/:id
 * Met à jour un utilisateur
 */
router.put('/:id', async function(req, res, next) {
  try {
    var user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour les champs fournis
    var { name, email, role } = req.body;
    var updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    
    await user.update(updateData);
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: error.errors.map(e => e.message)
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Supprime un utilisateur
 */
router.delete('/:id', async function(req, res, next) {
  try {
    var user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

