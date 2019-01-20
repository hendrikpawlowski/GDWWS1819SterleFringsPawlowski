const http = require('http');
const fakeapp = require('./fakeApp');

const port = 3069;

const server = http.createServer(fakeapp);

server.listen(port);

console.log("Server sprintet...");