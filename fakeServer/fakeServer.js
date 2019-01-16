const http = require('http');
const app = require('./fakeApp');

const port = 3069;

const server = http.createServer(app);

server.listen(port);

console.log("Server sprintet...");