/**
 * EXEMPLES D'UTILISATION DE SEQUELIZE AVEC SQLITE
 * 
 * Ce fichier montre comment utiliser Sequelize dans vos routes
 */

var User = require('../models/User');

// ============================================
// CRÉER UN UTILISATEUR
// ============================================
async function createUser() {
  try {
    var user = await User.create({
      username: 'admin',
      password: 'admin123', // ⚠️ À hasher en production !
      email: 'admin@example.com'
    });
    console.log('Utilisateur créé:', user.toJSON());
    return user;
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
}

// ============================================
// TROUVER UN UTILISATEUR PAR ID
// ============================================
async function findUserById(id) {
  try {
    var user = await User.findByPk(id);
    if (user) {
      console.log('Utilisateur trouvé:', user.toJSON());
    } else {
      console.log('Utilisateur non trouvé');
    }
    return user;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
}

// ============================================
// TROUVER UN UTILISATEUR PAR USERNAME
// ============================================
async function findUserByUsername(username) {
  try {
    var user = await User.findOne({
      where: { username: username }
    });
    return user;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
}

// ============================================
// TROUVER TOUS LES UTILISATEURS
// ============================================
async function findAllUsers() {
  try {
    var users = await User.findAll();
    console.log('Tous les utilisateurs:', users.map(u => u.toJSON()));
    return users;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
}

// ============================================
// METTRE À JOUR UN UTILISATEUR
// ============================================
async function updateUser(id, newData) {
  try {
    var user = await User.findByPk(id);
    if (user) {
      await user.update(newData);
      console.log('Utilisateur mis à jour:', user.toJSON());
      return user;
    } else {
      throw new Error('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }
}

// ============================================
// SUPPRIMER UN UTILISATEUR
// ============================================
async function deleteUser(id) {
  try {
    var user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      console.log('Utilisateur supprimé');
      return true;
    } else {
      throw new Error('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
}

// ============================================
// EXEMPLE D'UTILISATION DANS UNE ROUTE EXPRESS
// ============================================
/*
router.post('/login', async function(req, res, next) {
  try {
    var username = req.body.username;
    var password = req.body.password;
    
    // Chercher l'utilisateur
    var user = await User.findOne({
      where: { username: username }
    });
    
    if (!user) {
      return res.render('pages/login', {
        title: 'Connexion',
        website_title: WEBSITE_TITLE,
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe (à hasher avec bcrypt en production !)
    if (user.password !== password) {
      return res.render('pages/login', {
        title: 'Connexion',
        website_title: WEBSITE_TITLE,
        error: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }
    
    // Créer la session
    req.session.user = {
      id: user.id,
      username: user.username,
      login: user.username
    };
    
    res.redirect('/');
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    next(error);
  }
});
*/

module.exports = {
  createUser,
  findUserById,
  findUserByUsername,
  findAllUsers,
  updateUser,
  deleteUser
};

