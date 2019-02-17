var tls = require('tls');
var fs = require('fs');
var options = {
    host: '192.168.1.16',
    port: 8080,
    key: fs.readFileSync('openssl/ADMIN-client-key.pem'),
    cert: fs.readFileSync('openssl/ADMIN-client-cert.pem'),
    ca: [fs.readFileSync('openssl/ca-cert.pem')],
    rejectUnauthorized: false
};
var client = tls.connect(options, () => {
    console.log(`Client connected ${client.authorized ? 'authorized' : 'unauthorized'}`);
    process.stdin.setEncoding('utf8');
    // process.stdin.resume();
    process.stdin.on('readable', () => {
        var chunk = process.stdin.read();
        if (typeof chunk === 'string') {
            chunk = chunk.slice(0, -2);
            client.write(chunk);
        }
        if (chunk === '') {
            process.stdin.emit('end');
            return
        }
        if (chunk !== null) {
            process.stdout.write(`Sent data: ${chunk}\n`);
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
setTimeout(()=>{
    client.write('CLIENT1|OPEN');
    setTimeout(()=>{
        client.write('CLIENT2|OPEN');
        setTimeout(()=>{
            client.write('TEST-CLIENT|OPEN');
            setTimeout(()=>{
                client.write('123456');
            }, 1000)
        },1000)
    }, 1000)
}, 1000);
