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

// static files - must be before routes
app.use(express.static(path.join(__dirname, 'public')));

// importing the routes
try {
    require(path.join(__dirname, 'routes', 'Index.js'))(app);
    require(path.join(__dirname, 'routes', 'GrowtopiaGame.js'))(app);
    require(path.join(__dirname, 'routes', 'GrowtopiaWebview.js'))(app);
    require(path.join(__dirname, 'routes', 'DataCenter.js'))(app);
    console.log('All routes loaded successfully');
} catch (error) {
    console.error('Error loading routes:', error);
}

// 404 route
app.use((req, res) => {
    console.log(`[${new Date().toLocaleString()}] 404 Not Found: ${req.url} [${req.method}]`);
    res.status(404).send('Not Found');
});

// error handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toLocaleString()}] Error: ${err.message}`);
    res.status(500).send('Internal Server Error');
});

// exporting express app
module.exports = app;
