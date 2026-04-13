const fs = require('fs').promises;

function readFileContent(filepath) {
    return fs.readFile(filepath, 'utf8');
}

readFileContent(process.argv[2])
  .then(content => {
    console.log('Die Länge des Dateiinhalts beträgt:', content.length);
  })
  .catch(err => {
    console.error('Fehler beim Lesen der Datei:', err);
  });