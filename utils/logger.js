const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de log
const logDir = path.join(__dirname, '../log');
const logFile = path.join(logDir, 'latest-log.txt');

/**
 * S'assure que le dossier log existe
 */
function ensureLogDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Écrit un message dans le fichier de log avec timestamp
 * @param {string} message - Message à logger
 */
function writeLog(message) {
  try {
    ensureLogDir();
    
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = '[' + timestamp + '] ' + message + '\n';
    
    // Ajouter le message au fichier (append)
    fs.appendFileSync(logFile, logMessage, 'utf8');
  } catch (err) {
    console.error('Erreur lors de l\'écriture dans le log:', err);
  }
}

module.exports = {
  writeLog: writeLog
};

