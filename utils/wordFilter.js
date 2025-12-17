// Liste des mots interdits (insensible à la casse)
var BANNED_WORDS = [
  'test',
  'ouioui'
  // Ajoutez d'autres mots ici si nécessaire
];

/**
 * Filtre les mots interdits dans un message
 * Remplace les mots interdits par des astérisques
 * @param {string} message - Message à filtrer
 * @returns {string} - Message filtré
 */
function filterMessage(message) {
  if (!message || typeof message !== 'string') {
    return message;
  }
  
  var filteredMessage = message;
  
  // Parcourir chaque mot interdit
  BANNED_WORDS.forEach(function(bannedWord) {
    // Créer une expression régulière pour trouver le mot (insensible à la casse)
    // \b pour les limites de mots, gi pour global et insensible à la casse
    var regex = new RegExp('\\b' + escapeRegex(bannedWord) + '\\b', 'gi');
    
    // Remplacer le mot par des astérisques
    filteredMessage = filteredMessage.replace(regex, function(match) {
      return '*'.repeat(match.length);
    });
  });
  
  return filteredMessage;
}

/**
 * Échappe les caractères spéciaux pour les expressions régulières
 * @param {string} str - Chaîne à échapper
 * @returns {string} - Chaîne échappée
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  filterMessage: filterMessage,
  BANNED_WORDS: BANNED_WORDS
};

