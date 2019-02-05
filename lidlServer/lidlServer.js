const http = require('http');
const lidlApp = require('./lidlApp');

const port = 3069;

const server = http.createServer(fakeapp);

server.listen(port);

console.log("Server sprintet...\nPort: " + port);