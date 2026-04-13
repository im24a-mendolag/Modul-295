const fs = require('fs');
const path = process.argv[2]
fs.readFile(path, 'utf8', function(err, data) {
    err ? console.log(err) : console.log(count = data.split('\n').length - 1);
});


