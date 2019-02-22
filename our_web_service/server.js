const http = require('http');
const app = require('./app');

const port = 3001;

const server = http.createServer(app);

server.listen(port);

console.log("Server rennt...\nPort: " + port);