var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var WEBSITE_TITLE = indexRouter.WEBSITE_TITLE;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // moteur de template ici pour ejs important au vu du projet 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuration de la session
app.use(session({
  secret: 'secret-a-modif-en-production-haha-pas-oublier-hein',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// Middleware pour passer les informations de session à toutes les vues
app.use(function(req, res, next) {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 et redirection vers la page d'erreur
app.use(function(req, res, next) {
  next(createError(404));
});

// erreur
app.use(function(err, req, res, next) {
  // locals = message d'erreur seulement en environnement de dev
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

module.exports = app;
