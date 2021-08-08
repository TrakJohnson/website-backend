var express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// Routes imports
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

// BDD connection

  // BDA One
conBDA = mysql.createConnection({
  host: "mysql-bda-mines.alwaysdata.net",
  user: "bda-mines",
  password: "minesdavis",
  database: "53700_bda"
});

// open the MySQL connection
conBDA.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the BDA's database."); 
});

  // Portail one

conPortail = mysql.createConnection({
  host: "Ns37866.ip-91-121-8.eu",
  user: "bda",
  password: "m0ANsNwopInXDunZ",
  database: "portail"
});

// open the MySQL connection
conPortail.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the Portail's database."); 
});

let transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
      user: 'antoine.sherwood98@gmail.com',
      pass: 'Antoine99'
  }
}));

const app = express();

app.listen(4000, function () {
  console.log("Application d'exemple écoutant sur le port 4000 !");
});

app.use(express.json());
app.use(function(req, res,next){
  req.conBDA = conBDA;
  req.conPortail = conPortail;
  req.transporter = transporter;
  next();
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/user', userRoutes);
app.use('/api/event', eventRoutes);
