import express from 'express';
const router = express.Router();
import User from '../../models/User.js';
import { Op } from 'sequelize';

/**
 * GET /api/users
 * Récupère tous les utilisateurs
 */
router.get('/', async function(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    
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
    // Valider que l'ID est un nombre
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role']
    });
    
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
    const { name, email, role } = req.body;
    
    // Validation basique
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }
    
    // Vérifier si l'email existe déjà (unique)
    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email existe déjà'
        });
      }
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      name,
      email: email || null,
      role: role || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Gérer les erreurs de contrainte unique (email)
    if (error.name === 'SequelizeUniqueConstraintError') {
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
router.put('/:id', async function(req, res, next) {
  try {
    // Valider que l'ID est un nombre
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour les champs fournis
    const { name, email, role } = req.body;
    const updateData = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }
    if (email !== undefined) {
      updateData.email = email;
    }
    if (role !== undefined) {
      updateData.role = role;
    }
    
    if (Object.keys(updateData).length === 0) {
      // Aucune mise à jour demandée, retourner l'utilisateur actuel
      return res.json({
        success: true,
        message: 'Aucune modification effectuée',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // Vérifier si l'email existe déjà (si modifié)
    if (email !== undefined) {
      const emailExists = await User.findOne({ 
        where: { 
          email: email,
          id: { [Op.ne]: id }
        }
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Cet email existe déjà'
        });
      }
    }
    
    // Mettre à jour l'utilisateur
    await user.update(updateData);
    
    // Récupérer l'utilisateur mis à jour
    await user.reload();
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Gérer les erreurs de contrainte unique (email)
    if (error.name === 'SequelizeUniqueConstraintError') {
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
router.delete('/:id', async function(req, res, next) {
  try {
    // Valider que l'ID est un nombre
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Supprimer l'utilisateur
    await user.destroy();
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
