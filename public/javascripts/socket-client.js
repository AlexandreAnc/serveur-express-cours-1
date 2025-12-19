// Connexion Socket.IO automatique
(function() {
  // Se connecter au serveur Socket.IO avec configuration pour la production
  const socket = io({
    // Utiliser uniquement polling pour éviter les problèmes WebSocket avec Nginx
    transports: ['polling'],
    // Réessayer automatiquement en cas d'échec
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    timeout: 20000
  });
  
  // Événement de connexion réussie
  socket.on('connect', function() {
    console.log('Connecté au serveur Socket.IO');
  });
  
  // Événement de déconnexion
  socket.on('disconnect', function() {
    console.log('Déconnecté du serveur Socket.IO');
  });
  
  // Gérer les erreurs de connexion
  socket.on('connect_error', function(error) {
    console.error('Erreur de connexion Socket.IO:', error);
    // Le client réessayera automatiquement grâce à reconnection: true
  });
})();

