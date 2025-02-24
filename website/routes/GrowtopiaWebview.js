// importing the necessary modules
const path = require('path');
const cnf = require(path.join(__dirname, '..', 'Config.js'));

// exporting the route function
module.exports = (app) => {
    app.all('/player/login/dashboard', function (req, res) {
        return res.render('growtopia/DashboardView', { cnf: cnf });
    });

    app.all('/player/growid/login/validate', (req, res) => {
        let data = decodeURIComponent(req.query.data);
        
        res.send(`{"status":"success","message":"Account Validated.","token":"${data}","url":"","accountType":"growtopia"}`,);
    });

    app.all('/player/growid/checktoken', (req, res) => {
        res.send(`{"status":"success","message":"Account Validated.","token":"${req.body.refreshToken}","url":"","accountType":"growtopia"}`,);
    });
};