const readline = require('readline');
const rl = readline.createInterface({
    input:process.stdin, output:process.stdout
});





class bewertung {
    constructor(name, anzahl, ergebnis) {
        this.name = name;
        this.anzahl = anzahl;
        this.ergebnis = ergebnis;
        var that = this;
        var durchschnitt = function() {
            console.log("fuck off" + that.name);
        }
        var durchschnittBesser = () => console.log("fuck off" + this.name);
    }
}

var name = "Dennis";
const maxRate = 10;
var currentRate = 4.5;
var ratings = [];
var rating = [];
var ratingObjects = [];

console.log("Mein Name: " + name + "\nMaximale Bewertung: " + maxRate + 
"\nAktuelle Bewertung: " + currentRate);

rl.question("Bitte geben Sie den Namen Ihrer Bewertung ein: ", function(nameInput) {
    rating[0] = nameInput;
    ratingObjects.push(new bewertung(nameInput));
    rl.question("Bitte geben Sie eine Bewertung ein: ", function(eingabe){
        rating[1] = eingabe;
        einlesen(eingabe);
    });
});

function calcRatings() {
    var result = 0;
    for (var i=0; i<ratings.length; i++) {
        result += ratings[i];
    }
    result = result / ratings.length;
    ratingObjects[0].ergebnis = result;
    ratingObjects[0].anzahl = ratings.length;
    console.log("Aktuelle Bewertung: " + currentRate + "\nAnzahl der Bewertungen: " +
        ratings.length + "\nEndbewertung: " + result);
    console.log("Name der Bewertung: " + ratingObjects[0].name);
};

function einlesen(answer){
    var eingabe = parseInt(answer);
    if(!Number.isInteger(eingabe)){
        console.log("Bitch gib eine Zahl ein!");
        rl.question("Bitte geben Sie eine Bewertung ein: ", function(eingabe){
            einlesen(eingabe);
        });
    }
    if(answer > maxRate){
        console.log("Bitch gib eine kleinere Zahl ein!");
        rl.question("Bitte geben Sie eine Bewertung ein: ", function(eingabe){
            einlesen(eingabe);
        });
    }

    currentRate = eingabe;

    function check() {
    rl.question("Möchten Sie noch eine Bewertung abgeben?", function(answer){
            if(answer === "Ja" || answer === "ja") {
            ratings.push(currentRate);
            rl.question("Bitte geben Sie den Namen Ihrer Bewertung ein: ", function(nameInput) {
                ratingObjects.push(new bewertung(nameInput));
                rl.question("Bitte geben Sie eine Bewertung ein: ", function(eingabe){
                    einlesen(eingabe);
                });
            });
            } else if(answer === "Nein" || answer === "nein") {
                ratings.push(currentRate);
                rating[2] = ratings.length;
                rl.close();
                calcRatings();
                console.log("Name Ihrer Bewertung: " + rating[0] + "\nIhre Bewertung: " + 
                rating[1] + "\nAnzahl der Bewertungen: " + rating[2]);
            } else {
                console.log("Bitte antworten Sie mit ja oder nein");
                check();
            }
    });
    }
    check();
}

const hello = "hello";

var funktion1 = () => {
    const world = "World";
    const helloWorld1 = hello + world;
    console.log("Funktion 1: " + helloWorld1);

    var funktion2 = () => {
        const helloWorld2 = world + hello;
        console.log("Funktion 2: " + helloWorld2);
    }
    funktion2();
}

funktion1();


