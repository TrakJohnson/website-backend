// Exemple adapté de la mise en route d'Express : 
// http://expressjs.com/fr/starter/hello-world.html
var express = require('express');
const bodyParser = require('body-parser');
var app = express();

const mysql = require('mysql');

// '/' est la route racine
app.get('/', function (req, res) {
  res.send('Bonjour !');
});

app.listen(4000, function () {
  console.log("Application d'exemple écoutant sur le port 4000 !");
});

con = mysql.createConnection({
  host: "mysql-bda-mines.alwaysdata.net",
  user: "bda-mines",
  password: "minesdavis",
  database: "53700_bda"
});

// open the MySQL connection
con.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});