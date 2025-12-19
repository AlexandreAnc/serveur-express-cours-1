// Liste de mots interdits (anglais + français)
const BANNED_WORDS = [
  // Mots français courants
  'merde', 'putain', 'con', 'connard', 'connasse', 'salope', 'enculé', 'enculer',
  'bite', 'chier', 'chiant', 'pute', 'putes', 'foutre', 'fout', 'bordel',
  'crétin', 'crétine', 'idiot', 'idiote', 'débile', 'débiles',
  
  // Mots anglais courants
  'fuck', 'fucking', 'shit', 'damn', 'bitch', 'ass', 'asshole', 'bastard',
  'crap', 'hell', 'piss', 'pissed', 'dick', 'cock', 'pussy', 'whore',
  'slut', 'stupid', 'idiot', 'moron', 'retard', 'gay', 'fag', 'nigger',
  'nigga', 'cunt', 'motherfucker', 'motherfucking', 'bullshit', 'crap'
];

// Normaliser la liste (minuscules, sans doublons)
const normalizedBannedWords = [...new Set(BANNED_WORDS.map(word => word.toLowerCase()))];

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
    let filteredMessage = message;
    
    // Parcourir chaque mot interdit
    normalizedBannedWords.forEach(function(bannedWord) {
      // Créer une expression régulière pour trouver le mot (insensible à la casse)
      // \b pour les limites de mots, gi pour global et insensible à la casse
      const regex = new RegExp('\\b' + escapeRegex(bannedWord) + '\\b', 'gi');
      
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
    const messageLower = message.toLowerCase();
    return normalizedBannedWords.some(function(bannedWord) {
      // Vérifier si le mot interdit est présent dans le message
      const regex = new RegExp('\\b' + escapeRegex(bannedWord) + '\\b', 'i');
      return regex.test(messageLower);
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return false;
  }
}

export default {
  filterMessage: filterMessage,
  isProfane: isProfane,
  BANNED_WORDS: normalizedBannedWords // Exporter la liste pour accès si nécessaire
};

