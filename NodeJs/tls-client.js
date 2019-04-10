let tls = require('tls');
let fs = require('fs');
let options = {
    host: '192.168.1.101',
    port: 8080,
    key: fs.readFileSync('openssl/ADMIN-client-key.pem'),
    cert: fs.readFileSync('openssl/ADMIN-client-cert.pem'),
    ca: [fs.readFileSync('openssl/ca-cert.pem')],
    rejectUnauthorized: false
};
let client = tls.connect(options, () => {
    console.log(`Client connected ${client.authorized ? 'authorized' : 'unauthorized'}`);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data)=>{
        try {
            process.stdout.write(`Sent data: ${data}`);
            data = data.slice(0, -2);
            client.write(data);
        } catch (e) {
            process.stderr.write(`${e.message}\n`);
        }
    });
    process.stdin.on('end', () => {
        process.stdout.write('end');
    });
});
client.setEncoding('utf8');
client.on('data', (data) => {
    console.log(`Got Data: ${data}`);
});
client.write('ADMIN');

