var express = require('express');
var router = express.Router();
var db = require('../../config/database');

/**
 * GET /api/users
 * Récupère tous les utilisateurs
 */
router.get('/', function(req, res, next) {
  try {
    var stmt = db.prepare('SELECT id, name, email, role FROM users');
    var users = stmt.all();
    
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
router.get('/:id', function(req, res, next) {
  try {
    var stmt = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    var user = stmt.get(req.params.id);
    
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
router.post('/', function(req, res, next) {
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
      var checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
      var existingUser = checkStmt.get(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email existe déjà'
        });
      }
    }
    
    // Créer l'utilisateur
    var insertStmt = db.prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)');
    var result = insertStmt.run(name, email || null, role || null);
    
    // Récupérer l'utilisateur créé
    var selectStmt = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    var user = selectStmt.get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user
    });
  } catch (error) {
    // Gérer les erreurs de contrainte unique (email)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }
    next(error);
  }
});

/**
 * PUT /api/users/:id
 * Met à jour un utilisateur
 */
router.put('/:id', function(req, res, next) {
  try {
    // Vérifier que l'utilisateur existe
    var checkStmt = db.prepare('SELECT id FROM users WHERE id = ?');
    var existingUser = checkStmt.get(req.params.id);
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour les champs fournis
    var { name, email, role } = req.body;
    var updates = [];
    var values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (updates.length === 0) {
      // Aucune mise à jour demandée, retourner l'utilisateur actuel
      var selectStmt = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
      var user = selectStmt.get(req.params.id);
      return res.json({
        success: true,
        message: 'Aucune modification effectuée',
        data: user
      });
    }
    
    // Vérifier si l'email existe déjà (si modifié)
    if (email !== undefined) {
      var emailCheckStmt = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?');
      var emailExists = emailCheckStmt.get(email, req.params.id);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Cet email existe déjà'
        });
      }
    }
    
    // Construire et exécuter la requête UPDATE
    values.push(req.params.id);
    var updateQuery = 'UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?';
    var updateStmt = db.prepare(updateQuery);
    updateStmt.run.apply(updateStmt, values);
    
    // Récupérer l'utilisateur mis à jour
    var selectStmt = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?');
    var user = selectStmt.get(req.params.id);
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    // Gérer les erreurs de contrainte unique (email)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Supprime un utilisateur
 */
router.delete('/:id', function(req, res, next) {
  try {
    // Vérifier que l'utilisateur existe
    var checkStmt = db.prepare('SELECT id FROM users WHERE id = ?');
    var user = checkStmt.get(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Supprimer l'utilisateur
    var deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
    deleteStmt.run(req.params.id);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
