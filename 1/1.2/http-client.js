const http = require('http');
const url = process.argv[2]
try {
    http.get(url, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(data) {
            console.log(data);
        }).on('error', function(err) {
            console.log(err);
        });
    });
} catch(err) {
    console.log(err);
}


