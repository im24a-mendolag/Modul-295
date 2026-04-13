const port = process.argv[2]
const net = require('net');
const server = net.createServer(function(socket) {
    const now = new Date()
    const res = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`
    socket.end(res + '\n');
});

server.listen(port);
