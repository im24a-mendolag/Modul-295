const fs = require('fs');
const path = require('path');

const dir = process.argv[2]
const filter = process.argv[3]


fs.readdir(dir, function(err, files) {
    if (err) {
        console.log(err)
    }
    else {
        files.forEach(function(file) {
            if (path.extname(file) == '.' + filter) {
                console.log(file)
            };
        });
    }
});
