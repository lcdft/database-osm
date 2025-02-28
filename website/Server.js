// Importing the necessary modules
const path = require('path');
const app = require(path.join(__dirname, 'MainApp.js'));
const https = require('https');
const fs = require('fs');
const tls = require('tls');

const sniDefaultCert = fs.readFileSync(path.join(__dirname, 'certs/cdngtps.my.id-crt.pem'));
const sniDefaultKey = fs.readFileSync(path.join(__dirname, 'certs/cdngtps.my.id-key.pem'));

const sniCallback = (serverName, callback) => {
	console.log(serverName);
	let cert = null;
	let key = null;

	if (serverName != 'www.growtopia1.com' && serverName != 'www.growtopia2.com') {
        cert = sniDefaultCert;
		key = sniDefaultKey;
	} else {
        cert = fs.readFileSync(path.join(__dirname, 'certs/gt.pem'));
		key = fs.readFileSync(path.join(__dirname, 'certs/gt-key.pem'));
	}

	callback(null, new tls.createSecureContext({
		cert,
		key,
	}));
}

const serverOptions = {
    SNICallback: sniCallback,
    cert: sniDefaultCert,
    key: sniDefaultKey,
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    ciphers: [
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384'
    ].join(':'),
    honorCipherOrder: true,
    secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
    handshakeTimeout: 120000,
    rejectUnauthorized: false
}

// starting server with port 80
app.listen(80, () => {
    console.log('Server started at http://localhost:80');
});

// starting secure server with port 443
https.createServer(serverOptions, app).listen(443, () => {
    console.log('Secure server started at https://localhost:443');
});