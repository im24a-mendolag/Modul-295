const http = require('http');
const url = process.argv[2]
try {
    http.get(url, function(response) {
        let body = ''
        response.setEncoding('utf8');
        response.on('data', function(data) {
            body += data;
        });
        response.on('end', function() {
            console.log(body.length);
            console.log(body);
        }).on('error', function(err) {
            console.log(err);
        });
    });
} catch(err) {
    console.log(err);
}


