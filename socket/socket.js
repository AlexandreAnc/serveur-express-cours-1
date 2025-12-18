var logger = require('../utils/logger');
var wordFilter = require('../utils/wordFilter');
var db = require('../config/database');

// Configuration anti-spam
var RATE_LIMIT = {
  maxMessages: 5,      // Nombre maximum de messages
  timeWindow: 10000    // Fenêtre de temps en millisecondes (10 secondes)
};

/**
 * Configure les événements Socket.IO
 * @param {Object} io - Instance Socket.IO
 */
function setupSocket(io) {
  // Stocker les utilisateurs en train d'écrire (socketId -> pseudo)
  var typingUsers = {};
  
  // Stocker les utilisateurs qui ont rejoint le chat (socketId -> pseudo)
  var connectedUsers = {};
  
  // Stocker les pseudos actifs pour éviter les doublons (pseudo -> socketId)
  var pseudoToSocketId = {};
  
  // Fonction pour diffuser la liste des utilisateurs en train d'écrire
  function broadcastTypingUsers() {
    var typingList = Object.values(typingUsers);
    io.emit('typing-users', { users: typingList });
  }
  
  // Fonction pour nettoyer une connexion utilisateur
  function cleanupUser(socketId) {
    var pseudo = connectedUsers[socketId];
    if (pseudo) {
      delete connectedUsers[socketId];
      // Nettoyer aussi le mapping pseudo -> socketId si c'est le bon socket
      if (pseudoToSocketId[pseudo] === socketId) {
        delete pseudoToSocketId[pseudo];
      }
    }
  }
  
  // Fonction pour diffuser le nombre d'utilisateurs connectés (uniquement ceux qui ont rejoint)
  function broadcastUserCount() {
    var userCount = Object.keys(connectedUsers).length;
    io.emit('user-count', { count: userCount });
  }
  
  // Fonction pour récupérer les 5 derniers messages de l'historique
  function getLastMessages(limit) {
    try {
      var stmt = db.prepare('SELECT pseudo, message, timestamp FROM messages ORDER BY id DESC LIMIT ?');
      var messages = stmt.all(limit || 5);
      // Inverser pour avoir les plus anciens en premier
      return messages.reverse();
    } catch (error) {
      logger.writeLog('Erreur lors de la récupération de l\'historique: ' + error.message);
      return [];
    }
  }
  
  // Fonction pour sauvegarder un message dans la base de données
  function saveMessage(pseudo, message, timestamp) {
    try {
      var insertStmt = db.prepare('INSERT INTO messages (pseudo, message, timestamp) VALUES (?, ?, ?)');
      insertStmt.run(pseudo, message, timestamp);
      
      // Garder seulement les 5 derniers messages (supprimer les anciens)
      var deleteStmt = db.prepare('DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY id DESC LIMIT 5)');
      deleteStmt.run();
    } catch (error) {
      logger.writeLog('Erreur lors de la sauvegarde du message: ' + error.message);
    }
  }
  
  io.on('connection', function(socket) {
    // Récupérer l'adresse IP du client
    var clientIp = socket.request.connection.remoteAddress || 
                   socket.request.headers['x-forwarded-for'] || 
                   'unknown';
    
    // Logger la connexion
    logger.writeLog('Nouvel utilisateur connecté - IP: ' + clientIp + ' - Socket ID: ' + socket.id);
    
    // Stocker les timestamps des messages pour le rate limiting
    socket.messageTimestamps = [];
    
    // Timer pour arrêter automatiquement le "typing" après 3 secondes d'inactivité
    var typingTimeout = null;
    
    // Fonction pour vérifier le rate limit
    function checkRateLimit() {
      var now = Date.now();
      
      // Nettoyer les timestamps anciens (hors de la fenêtre de temps)
      socket.messageTimestamps = socket.messageTimestamps.filter(function(timestamp) {
        return (now - timestamp) < RATE_LIMIT.timeWindow;
      });
      
      // Vérifier si la limite est dépassée
      if (socket.messageTimestamps.length >= RATE_LIMIT.maxMessages) {
        return false; // Rate limit dépassé
      }
      
      // Ajouter le timestamp actuel
      socket.messageTimestamps.push(now);
      return true; // OK
    }
    
    // Événement quand un utilisateur rejoint le chat avec son pseudo
    socket.on('join-chat', function(data) {
      var pseudo = data.pseudo || 'Anonyme';
      
      // Si ce pseudo est déjà connecté avec un autre socket, nettoyer l'ancienne connexion
      if (pseudoToSocketId[pseudo] && pseudoToSocketId[pseudo] !== socket.id) {
        var oldSocketId = pseudoToSocketId[pseudo];
        // Nettoyer l'ancienne connexion
        cleanupUser(oldSocketId);
        // Déconnecter l'ancien socket s'il existe encore
        var oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
        }
        logger.writeLog('Ancienne connexion nettoyée pour pseudo: ' + pseudo + ' - Ancien Socket ID: ' + oldSocketId);
      }
      
      // Sauvegarder le pseudo dans la socket
      socket.pseudo = pseudo;
      
      // Ajouter l'utilisateur à la liste des utilisateurs connectés
      connectedUsers[socket.id] = pseudo;
      pseudoToSocketId[pseudo] = socket.id;
      
      // Logger l'arrivée dans le chat
      logger.writeLog('Utilisateur rejoint le chat - Pseudo: ' + pseudo + ' - Socket ID: ' + socket.id);
      
      // Envoyer l'historique des 5 derniers messages au nouvel utilisateur
      var lastMessages = getLastMessages(5);
      if (lastMessages.length > 0) {
        socket.emit('chat-history', {
          messages: lastMessages
        });
      }
      
      // Diffuser le nouveau nombre d'utilisateurs connectés
      broadcastUserCount();
      
      // Diffuser à tous les utilisateurs qu'un nouvel utilisateur a rejoint
      io.emit('user-joined', {
        pseudo: pseudo
      });
    });
    
    // Événement pour recevoir un message
    socket.on('chat-message', function(data) {
      // Vérifier le rate limit
      if (!checkRateLimit()) {
        // Rate limit dépassé, envoyer un message d'erreur au client
        socket.emit('rate-limit-exceeded', {
          message: 'Vous envoyez trop de messages. Veuillez patienter quelques secondes.',
          retryAfter: Math.ceil((RATE_LIMIT.timeWindow - (Date.now() - socket.messageTimestamps[0])) / 1000)
        });
        logger.writeLog('Rate limit dépassé - Pseudo: ' + (socket.pseudo || 'Anonyme') + ' - Socket ID: ' + socket.id);
        return;
      }
      
      var pseudo = socket.pseudo || data.pseudo || 'Anonyme';
      var message = data.message || '';
      
      // Vérifier que le message n'est pas vide
      if (!message.trim()) {
        return;
      }
      
      // Limiter la longueur du message
      if (message.length > 500) {
        message = message.substring(0, 500);
      }
      
      // Filtrer les mots interdits
      var originalMessage = message;
      message = wordFilter.filterMessage(message);
      
      // Logger le message (original pour les logs, filtré pour l'affichage)
      if (originalMessage !== message) {
        logger.writeLog('Message filtré - Pseudo: ' + pseudo + ' - Original: ' + originalMessage.substring(0, 50) + ' - Filtré: ' + message.substring(0, 50));
      } else {
        logger.writeLog('Message chat - Pseudo: ' + pseudo + ' - Message: ' + message.substring(0, 50));
      }
      
      // Créer le timestamp
      var timestamp = new Date().toISOString();
      
      // Sauvegarder le message dans la base de données
      saveMessage(pseudo, message, timestamp);
      
      // Diffuser le message filtré à tous les utilisateurs
      io.emit('new-message', {
        pseudo: pseudo,
        message: message,
        timestamp: timestamp
      });
      
      // Arrêter l'indicateur de frappe après l'envoi d'un message
      if (typingUsers[socket.id]) {
        delete typingUsers[socket.id];
        broadcastTypingUsers();
      }
    });
    
    // Événement quand un utilisateur est en train d'écrire
    socket.on('typing', function() {
      var pseudo = socket.pseudo;
      if (!pseudo) {
        return;
      }
      
      // Ajouter l'utilisateur à la liste s'il n'y est pas déjà
      if (!typingUsers[socket.id]) {
        typingUsers[socket.id] = pseudo;
        broadcastTypingUsers();
      }
      
      // Réinitialiser le timer d'arrêt automatique
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Arrêter automatiquement après 5 secondes d'inactivité
      typingTimeout = setTimeout(function() {
        if (typingUsers[socket.id]) {
          delete typingUsers[socket.id];
          broadcastTypingUsers();
        }
      }, 5000);
    });
    
    // Événement quand un utilisateur arrête d'écrire
    socket.on('stop-typing', function() {
      if (typingUsers[socket.id]) {
        delete typingUsers[socket.id];
        broadcastTypingUsers();
      }
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }
    });
    
    // Nettoyer immédiatement lors de la connexion si le socket est déjà dans la liste
    // (cas où le disconnect n'a pas encore été traité)
    if (connectedUsers[socket.id]) {
      cleanupUser(socket.id);
    }
    
    // Événement de déconnexion
    socket.on('disconnect', function(reason) {
      // Retirer l'utilisateur de la liste des utilisateurs en train d'écrire
      if (typingUsers[socket.id]) {
        delete typingUsers[socket.id];
        broadcastTypingUsers();
      }
      
      // Retirer l'utilisateur de la liste des utilisateurs connectés
      if (connectedUsers[socket.id]) {
        cleanupUser(socket.id);
        // Diffuser le nouveau nombre d'utilisateurs connectés après la déconnexion
        broadcastUserCount();
      }
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      logger.writeLog('Utilisateur déconnecté - IP: ' + clientIp + ' - Socket ID: ' + socket.id + ' - Raison: ' + reason);
    });
  });
}

module.exports = setupSocket;

