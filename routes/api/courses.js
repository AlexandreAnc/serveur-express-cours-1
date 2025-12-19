const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const User = require('../../models/User');

/**
 * GET /api/courses
 * Récupère tous les cours avec leurs instructeurs
 */
router.get('/', async function(req, res, next) {
  try {
    const courses = await Course.findAll({
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email'],
        required: false
      }],
      order: [['id', 'ASC']]
    });
    
    // Formater les résultats pour correspondre au format attendu par le frontend
    const formattedCourses = courses.map(function(course) {
      const courseData = {
        id: course.id,
        title: course.title,
        price: course.price,
        instructor_id: course.instructor_id
      };
      
      // Ajouter l'instructeur si présent
      if (course.instructor) {
        courseData.instructor = {
          id: course.instructor.id,
          name: course.instructor.name,
          email: course.instructor.email
        };
      } else {
        courseData.instructor = null;
      }
      
      return courseData;
    });
    
    res.json({
      success: true,
      data: formattedCourses,
      count: formattedCourses.length
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
    // Valider que l'ID est un nombre
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });
    }
    
    const course = await Course.findByPk(id, {
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email'],
        required: false
      }]
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Formater le résultat
    const courseData = {
      id: course.id,
      title: course.title,
      price: course.price,
      instructor_id: course.instructor_id
    };
    
    // Ajouter l'instructeur si présent
    if (course.instructor) {
      courseData.instructor = {
        id: course.instructor.id,
        name: course.instructor.name,
        email: course.instructor.email
      };
    } else {
      courseData.instructor = null;
    }
    
    res.json({
      success: true,
      data: courseData
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
    const { title, price, instructor_id } = req.body;
    
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
      const instructor = await User.findByPk(instructor_id);
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructeur non trouvé'
        });
      }
    }
    
    // Créer le cours
    const course = await Course.create({
      title,
      price,
      instructor_id: instructor_id || null
    });
    
    // Récupérer le cours créé avec l'instructeur
    await course.reload({
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email'],
        required: false
      }]
    });
    
    // Formater le résultat
    const courseData = {
      id: course.id,
      title: course.title,
      price: course.price,
      instructor_id: course.instructor_id
    };
    
    if (course.instructor) {
      courseData.instructor = {
        id: course.instructor.id,
        name: course.instructor.name,
        email: course.instructor.email
      };
    } else {
      courseData.instructor = null;
    }
    
    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: courseData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/courses/:id
 * Met à jour un cours
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
    
    // Vérifier que le cours existe
    const course = await Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Mettre à jour les champs fournis
    const { title, price, instructor_id } = req.body;
    const updateData = {};
    
    if (title !== undefined) {
      updateData.title = title;
    }
    if (price !== undefined) {
      updateData.price = price;
    }
    if (instructor_id !== undefined) {
      // Vérifier que l'instructeur existe
      if (instructor_id) {
        const instructor = await User.findByPk(instructor_id);
        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructeur non trouvé'
          });
        }
      }
      updateData.instructor_id = instructor_id;
    }
    
    if (Object.keys(updateData).length === 0) {
      // Aucune mise à jour demandée, retourner le cours actuel avec l'instructeur
      await course.reload({
        include: [{
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'email'],
          required: false
        }]
      });
      
      const courseData = {
        id: course.id,
        title: course.title,
        price: course.price,
        instructor_id: course.instructor_id
      };
      
      if (course.instructor) {
        courseData.instructor = {
          id: course.instructor.id,
          name: course.instructor.name,
          email: course.instructor.email
        };
      } else {
        courseData.instructor = null;
      }
      
      return res.json({
        success: true,
        message: 'Aucune modification effectuée',
        data: courseData
      });
    }
    
    // Mettre à jour le cours
    await course.update(updateData);
    
    // Récupérer le cours mis à jour avec l'instructeur
    await course.reload({
      include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'name', 'email'],
        required: false
      }]
    });
    
    const courseData = {
      id: course.id,
      title: course.title,
      price: course.price,
      instructor_id: course.instructor_id
    };
    
    if (course.instructor) {
      courseData.instructor = {
        id: course.instructor.id,
        name: course.instructor.name,
        email: course.instructor.email
      };
    } else {
      courseData.instructor = null;
    }
    
    res.json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: courseData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/courses/:id
 * Supprime un cours
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
    
    // Vérifier que le cours existe
    const course = await Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Supprimer le cours
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
