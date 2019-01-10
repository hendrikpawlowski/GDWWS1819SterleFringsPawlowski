var request = require("request")

var url = "http://api.open-notify.org/astros.json";

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
    }
})