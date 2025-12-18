var express = require('express');
var router = express.Router();
var Course = require('../../models/Course');
var User = require('../../models/User');

/**
 * GET /api/courses
 * Récupère tous les cours avec leurs instructeurs
 */
router.get('/', async function(req, res, next) {
  try {
    var courses = await Course.findAll({
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id
 * Récupère un cours par son ID avec son instructeur
 */
router.get('/:id', async function(req, res, next) {
  try {
    var course = await Course.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/courses
 * Crée un nouveau cours
 */
router.post('/', async function(req, res, next) {
  try {
    var { title, price, instructor_id } = req.body;
    
    // Validation basique
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Le titre est requis'
      });
    }
    
    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Le prix est requis'
      });
    }
    
    // Vérifier que l'instructeur existe
    if (instructor_id) {
      var instructor = await User.findByPk(instructor_id);
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructeur non trouvé'
        });
      }
    }
    
    // Créer le cours
    var course = await Course.create({
      title: title,
      price: price,
      instructor_id: instructor_id || null
    });
    
    // Récupérer le cours avec l'instructeur
    var courseWithInstructor = await Course.findByPk(course.id, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: courseWithInstructor
    });
  } catch (error) {
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
 * PUT /api/courses/:id
 * Met à jour un cours
 */
router.put('/:id', async function(req, res, next) {
  try {
    var course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Mettre à jour les champs fournis
    var { title, price, instructor_id } = req.body;
    var updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (instructor_id !== undefined) {
      // Vérifier que l'instructeur existe
      if (instructor_id) {
        var instructor = await User.findByPk(instructor_id);
        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructeur non trouvé'
          });
        }
      }
      updateData.instructor_id = instructor_id;
    }
    
    await course.update(updateData);
    
    // Récupérer le cours mis à jour avec l'instructeur
    var updatedCourse = await Course.findByPk(course.id, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    res.json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: updatedCourse
    });
  } catch (error) {
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
 * DELETE /api/courses/:id
 * Supprime un cours
 */
router.delete('/:id', async function(req, res, next) {
  try {
    var course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    await course.destroy();
    
    res.json({
      success: true,
      message: 'Cours supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

