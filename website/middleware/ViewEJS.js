// importing the necessary modules
const path = require('path');

// exporting the middleware function
module.exports = (app) => {
    const ejs = require('ejs');

    // setting the view engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', 'views'));
};