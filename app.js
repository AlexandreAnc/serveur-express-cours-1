// Charger les variables d'environnement depuis .env
import 'dotenv/config';

import createError from 'http-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import cors from 'cors';
import passport from './config/passport.js';

import indexRouter, { WEBSITE_TITLE } from './routes/index.js';
import apiRouter from './routes/api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialiser Sequelize ORM
import sequelize from './config/sequelize.js';
import User from './models/User.js'; // Charger le modèle User
import Course from './models/Course.js'; // Charger le modèle Course pour initialiser les relations
import Message from './models/Message.js'; // Charger le modèle Message

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // moteur de template ici pour ejs important au vu du projet 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuration CORS pour l'API
app.use(cors({
  origin: '*', // En production, spécifier les domaines autorisés
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-a-modif-en-production-haha-pas-oublier-hein',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware pour passer les informations de session à toutes les vues
app.use(function(req, res, next) {
  // Utiliser req.user de Passport si disponible, sinon req.session.user
  res.locals.user = req.user || req.session.user || null;
  res.locals.isAuthenticated = !!req.user || !!req.session.user;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Routes web (pages EJS)
app.use('/', indexRouter);

// Routes API RESTful
app.use('/api', apiRouter);

// 404 et redirection vers la page d'erreur
app.use(function(req, res, next) {
  next(createError(404));
});

// Gestion des erreurs
app.use(function(err, req, res, next) {
  // Si c'est une requête API, retourner du JSON
  if (req.path.startsWith('/api')) {
    res.status(err.status || 500);
    res.json({
      success: false,
      message: err.message || 'Erreur serveur',
      error: req.app.get('env') === 'development' ? err : {}
    });
    return;
  }
  
  // Sinon, rendre la page d'erreur EJS
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('pages/error', {
    title: err.status === 404 ? 'Page non trouvée' : 'Erreur',
    website_title: WEBSITE_TITLE,
    status: err.status || 500,
    error: res.locals.error
  });
});

export default app;
