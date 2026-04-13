fetch('https://httpbin.org/status/403', { method: 'DELETE' })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Fehler: ' + response.status);
        }
    })

    .catch(function(err) {
        console.log(err.message);
    })

    .finally(function() {
        console.log('Anfrage abgeschlossen');
    });



async function task2(url) {
    try {
        const response = await fetch(url, { method: 'DELETE' })
        if (!response.ok) {
            throw new Error('Fehler: ' + response.status);
        }
    } catch(err) {
        console.log(err.message);
    } finally {
        console.log('Anfrage abgeschlossen');
    }
}

Promise.all([
    fetch('https://httpbin.org/delay/1'),
    fetch('https://httpbin.org/delay/2'),
    fetch('https://httpbin.org/delay/3')
]).then(function(responses) {
    responses.forEach(r => console.log(r.status));
});

async function task4(url, retries = 10) {
    try {
        const response = await fetch(url, { method: 'DELETE' })
        if (!response.ok) {
            throw new Error('Fehler: ' + response.status);
        }
    } 
    catch(err) {
        if (retries > 0) {
            return task4(url, retries - 1);
        } else {
            console.log('Alle Versuche fehlgeschlagen:', err.message);
        }
    }
}

task4('https://httpbin.org/status/403');