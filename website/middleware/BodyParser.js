// importing the necessary modules
const bodyParser = require('body-parser');
const express = require('express');

// exporting the middleware function
module.exports = (app) => {
    // setting the body parser middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());
};