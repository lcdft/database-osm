// importing the necessary modules
const rateLimit = require('express-rate-limit');

// exporting the security function
module.exports = (app) => {
    // setting the rate limiter
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        headers: true,
    }));
};