// importing the necessary modules
const path = require('path');
const express = require('express');
// exporting the route
module.exports = (app) => {
    // setting index route
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept',
        );
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
        );
        console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
        next();
    });

    // static files
    app.use(express.static(path.join(__dirname, '../public')));

    // home page
    app.get('/', (req, res) => {
        res.render('IndexView');
    });
}