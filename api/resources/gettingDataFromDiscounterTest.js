var request = require("request");

// Discounter in USA: var url = "https://api.discountapi.com/v2/deals?api_key=YOUR_API_KEY=lOESXybs";
var url = "https://shop.rewe.de/api/ingredients/mapper";

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {

        console.log(body); // Print the json response
    }
})