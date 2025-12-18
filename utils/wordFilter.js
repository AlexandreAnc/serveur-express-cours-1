var badWordsList = require('badwords-list');

// Liste de mots interdits (combinaison de badwords-list + mots français)
var BANNED_WORDS = [];

// Ajouter les mots de badwords-list (anglais)
BANNED_WORDS = BANNED_WORDS.concat(badWordsList.array);

// Ajouter des mots français courants
var frenchBadWords = [
  'merde', 'putain', 'con', 'connard', 'connasse'
];

BANNED_WORDS = BANNED_WORDS.concat(frenchBadWords);

// Normaliser la liste (minuscules, sans doublons)
BANNED_WORDS = [...new Set(BANNED_WORDS.map(word => word.toLowerCase()))];

/**
 * Échappe les caractères spéciaux pour les expressions régulières
 * @param {string} str - Chaîne à échapper
 * @returns {string} - Chaîne échappée
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
  
  try {
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
  } catch (error) {
    // En cas d'erreur, retourner le message original
    console.error('Erreur lors du filtrage:', error);
    return message;
  }
}

/**
 * Vérifie si un message contient des mots interdits
 * @param {string} message - Message à vérifier
 * @returns {boolean} - true si le message contient des mots interdits
 */
function isProfane(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  try {
    var messageLower = message.toLowerCase();
    return BANNED_WORDS.some(function(bannedWord) {
      // Vérifier si le mot interdit est présent dans le message
      var regex = new RegExp('\\b' + escapeRegex(bannedWord) + '\\b', 'i');
      return regex.test(messageLower);
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return false;
  }
}

module.exports = {
  filterMessage: filterMessage,
  isProfane: isProfane,
  BANNED_WORDS: BANNED_WORDS // Exporter la liste pour accès si nécessaire
};

