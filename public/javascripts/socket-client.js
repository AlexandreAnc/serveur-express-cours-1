// Connexion Socket.IO automatique
(function() {
  // Se connecter au serveur Socket.IO
  var socket = io();
  
  // Événement de connexion réussie
  socket.on('connect', function() {
    console.log('Connecté au serveur Socket.IO');
  });
  
  // Événement de déconnexion
  socket.on('disconnect', function() {
    console.log('Déconnecté du serveur Socket.IO');
  });
})();

