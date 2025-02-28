// importing the necessary modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// creating an express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setting up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// importing the routes
require(path.join(__dirname, 'routes', 'Index.js'))(app);
require(path.join(__dirname, 'routes', 'GrowtopiaGame.js'))(app);
require(path.join(__dirname, 'routes', 'GrowtopiaWebview.js'))(app);
require(path.join(__dirname, 'routes', 'DataCenter.js'))(app);

// static files
app.use(express.static(path.join(__dirname, 'public')));

// 404 route
app.use((req, res) => {
    console.log(`[${new Date().toLocaleString()}] Missing file: ${req.url} [${req.method}] - ${res.statusCode}`);
    return res.status(200).send('404 - File not found');
});

// exporting express app
module.exports = app;