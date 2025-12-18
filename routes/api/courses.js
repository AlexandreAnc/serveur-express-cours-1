var express = require('express');
var router = express.Router();
var db = require('../../config/database');

/**
 * GET /api/courses
 * Récupère tous les cours avec leurs instructeurs
 */
router.get('/', function(req, res, next) {
  try {
    var stmt = db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.price,
        c.instructor_id,
        u.id as instructor_id_full,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      ORDER BY c.id
    `);
    var rows = stmt.all();
    
    // Formater les résultats pour correspondre au format attendu par le frontend
    var courses = rows.map(function(row) {
      var course = {
        id: row.id,
        title: row.title,
        price: row.price,
        instructor_id: row.instructor_id
      };
      
      // Ajouter l'instructeur si présent
      if (row.instructor_id_full) {
        course.instructor = {
          id: row.instructor_id_full,
          name: row.instructor_name,
          email: row.instructor_email
        };
      } else {
        course.instructor = null;
      }
      
      return course;
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
router.get('/:id', function(req, res, next) {
  try {
    var stmt = db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.price,
        c.instructor_id,
        u.id as instructor_id_full,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `);
    var row = stmt.get(req.params.id);
    
    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Formater le résultat
    var course = {
      id: row.id,
      title: row.title,
      price: row.price,
      instructor_id: row.instructor_id
    };
    
    // Ajouter l'instructeur si présent
    if (row.instructor_id_full) {
      course.instructor = {
        id: row.instructor_id_full,
        name: row.instructor_name,
        email: row.instructor_email
      };
    } else {
      course.instructor = null;
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
router.post('/', function(req, res, next) {
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
      var instructorStmt = db.prepare('SELECT id FROM users WHERE id = ?');
      var instructor = instructorStmt.get(instructor_id);
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructeur non trouvé'
        });
      }
    }
    
    // Créer le cours
    var insertStmt = db.prepare('INSERT INTO courses (title, price, instructor_id) VALUES (?, ?, ?)');
    var result = insertStmt.run(title, price, instructor_id || null);
    
    // Récupérer le cours créé avec l'instructeur
    var selectStmt = db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.price,
        c.instructor_id,
        u.id as instructor_id_full,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `);
    var row = selectStmt.get(result.lastInsertRowid);
    
    // Formater le résultat
    var course = {
      id: row.id,
      title: row.title,
      price: row.price,
      instructor_id: row.instructor_id
    };
    
    if (row.instructor_id_full) {
      course.instructor = {
        id: row.instructor_id_full,
        name: row.instructor_name,
        email: row.instructor_email
      };
    } else {
      course.instructor = null;
    }
    
    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/courses/:id
 * Met à jour un cours
 */
router.put('/:id', function(req, res, next) {
  try {
    // Vérifier que le cours existe
    var checkStmt = db.prepare('SELECT id FROM courses WHERE id = ?');
    var existingCourse = checkStmt.get(req.params.id);
    
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Mettre à jour les champs fournis
    var { title, price, instructor_id } = req.body;
    var updates = [];
    var values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (instructor_id !== undefined) {
      // Vérifier que l'instructeur existe
      if (instructor_id) {
        var instructorStmt = db.prepare('SELECT id FROM users WHERE id = ?');
        var instructor = instructorStmt.get(instructor_id);
        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructeur non trouvé'
          });
        }
      }
      updates.push('instructor_id = ?');
      values.push(instructor_id);
    }
    
    if (updates.length === 0) {
      // Aucune mise à jour demandée, retourner le cours actuel avec l'instructeur
      var selectStmt = db.prepare(`
        SELECT 
          c.id,
          c.title,
          c.price,
          c.instructor_id,
          u.id as instructor_id_full,
          u.name as instructor_name,
          u.email as instructor_email
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.id = ?
      `);
      var row = selectStmt.get(req.params.id);
      
      var course = {
        id: row.id,
        title: row.title,
        price: row.price,
        instructor_id: row.instructor_id
      };
      
      if (row.instructor_id_full) {
        course.instructor = {
          id: row.instructor_id_full,
          name: row.instructor_name,
          email: row.instructor_email
        };
      } else {
        course.instructor = null;
      }
      
      return res.json({
        success: true,
        message: 'Aucune modification effectuée',
        data: course
      });
    }
    
    // Construire et exécuter la requête UPDATE
    values.push(req.params.id);
    var updateQuery = 'UPDATE courses SET ' + updates.join(', ') + ' WHERE id = ?';
    var updateStmt = db.prepare(updateQuery);
    updateStmt.run.apply(updateStmt, values);
    
    // Récupérer le cours mis à jour avec l'instructeur
    var selectStmt = db.prepare(`
      SELECT 
        c.id,
        c.title,
        c.price,
        c.instructor_id,
        u.id as instructor_id_full,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
    `);
    var row = selectStmt.get(req.params.id);
    
    var course = {
      id: row.id,
      title: row.title,
      price: row.price,
      instructor_id: row.instructor_id
    };
    
    if (row.instructor_id_full) {
      course.instructor = {
        id: row.instructor_id_full,
        name: row.instructor_name,
        email: row.instructor_email
      };
    } else {
      course.instructor = null;
    }
    
    res.json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/courses/:id
 * Supprime un cours
 */
router.delete('/:id', function(req, res, next) {
  try {
    // Vérifier que le cours existe
    var checkStmt = db.prepare('SELECT id FROM courses WHERE id = ?');
    var course = checkStmt.get(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Supprimer le cours
    var deleteStmt = db.prepare('DELETE FROM courses WHERE id = ?');
    deleteStmt.run(req.params.id);
    
    res.json({
      success: true,
      message: 'Cours supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
