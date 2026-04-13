const fs = require('fs');
const path = process.argv[2]
const data = fs.readFileSync(path, 'utf8');
const count = data.split('\n').length - 1;

console.log(count);
