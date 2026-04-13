const http = require('http');
const urlarr = [process.argv[2],process.argv[3],process.argv[4]]

const results = [];
let completed = 0;

urlarr.forEach(function(url, index) {
    http.get(url, function(response) {
        let body = ''
        response.setEncoding('utf8');
        response.on('data', function(data) {
            body += data;
        });
        response.on('end', function() {
            results[index] = body;
            completed++;
            if (completed === urlarr.length) {
                results.forEach(r => console.log(r));
            }
        });
    });
});




