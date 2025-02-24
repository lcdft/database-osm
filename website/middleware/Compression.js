// importing the necessary modules
const compression = require('compression');

// exporting the middleware function
module.exports = (app) => {
    // setting the compression middleware
    app.use(compression({
        level: 5,
        threshold: 0,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    }));
}