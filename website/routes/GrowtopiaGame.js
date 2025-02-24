// importing the necessary modules
const path = require('path');
const cnf = require(path.join(__dirname, '..', 'Config.js'));
const fs = require('fs');

// exporting the route function
module.exports = (app) => {
    app.post('/growtopia/server_data.php', function (req, res) {

        const content = `server|${cnf.server_data.ip}
port|${cnf.server_data.port}
type|1
#maint|lorem ipsum
loginurl|${cnf.server_data.loginurl}
meta|${cnf.server_data.meta}
RTENDMARKERBS1001`;
        return res.send(content);
    });

    app.all('/cache/', async (req, res, next) => {
        if (fs.existsSync(path.join(__dirname, "..", "public", req.url))) {
            res.sendFile(path.join(__dirname, "..", "public", req.url));
        } else {
            next();
        }
    });
};