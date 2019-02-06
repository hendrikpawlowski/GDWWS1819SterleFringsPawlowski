const http = require('http');
const aldiApp = require('./aldiApp');


const port = 3070;

const server = http.createServer(aldiApp);

server.listen(port);

console.log("Server joggt gemütlich...\nPort: " + port);
