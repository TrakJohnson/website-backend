const express = require('express');
const mysql = require('mysql');
const path = require('path');

// imports .env + environment variables
// access variables through process.env["KEY"]
require('dotenv').config({path: path.resolve(__dirname, '.env')})


// --- Routes imports

const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const teamRoutes = require('./routes/teamRoutes');
const poleRoutes = require('./routes/poleRoutes');
const recoverRoutes = require('./routes/recoverRoutes')
const contactRoutes = require('./routes/contactRoutes')


// --- SQL connections

// BDA
conBDA = mysql.createConnection({
    host: process.env["SQL_BDA_HOST"],
    user: process.env["SQL_BDA_USER"],
    password: process.env["SQL_BDA_PASS"],
    database: "53700_bda",
    dateStrings: true // very important, else MySQL will transform the "datetime" columns on request
});
conBDA.connect(error => {
    if (error) {
        console.log("Erreur de connection a la DB BDA")
        throw error;
    }
    console.log("Successfully connected to the BDA's database.");
});

// Portail
conPortail = mysql.createConnection({
    host: "Ns37866.ip-91-121-8.eu",
    user: process.env["SQL_PORTAIL_USER"],
    password: process.env["SQL_PORTAIL_PASS"],
    database: "portail"
});
conPortail.connect(error => {
    if (error) throw error;
});


// --- setup scheduler

const {EventScheduler} = require('./functions/event_scheduler')
const eventScheduler = new EventScheduler(conBDA)
eventScheduler.resetSchedule()

// --- start express app

const app = express();

app.listen(4000, function () {
});

app.use(express.json({limit: '8mb'}));
app.use(function (req, res, next) {
    req.conBDA = conBDA
    req.conPortail = conPortail
    req.eventScheduler = eventScheduler
    // req.transporter = transporter;
    console.log({laal: req.url});
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
app.use('/api/team', teamRoutes);
app.use('/api/pole', poleRoutes);
app.use('/api/recover', recoverRoutes);
app.use('/api/contact', contactRoutes);
