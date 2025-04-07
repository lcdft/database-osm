// importing the necessary modules
const path = require('path');
const express = require('express');
// exporting the route
module.exports = (app) => {
    // setting index route
    app.use(function (req, res, next) {
        res.header('X-DNS-Prefetch-Control', 'off');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
        );
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.header('Surrogate-Control', 'no-store');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        // Log after the response is sent
        res.on('finish', () => {
            console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
        });
        
        next();
    });

    // static files
    app.use(express.static(path.join(__dirname, '../public')));

    // home page
    app.get('/', (req, res) => {
        try {
            res.render('IndexView');
        } catch (error) {
            console.error('Error rendering IndexView:', error);
            res.status(500).send('Error rendering page');
        }
    });
}
