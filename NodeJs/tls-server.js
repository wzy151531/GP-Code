let tls = require('tls');
let fs = require('fs');
let moment = require('moment');
moment.locale('zh-cn');
// 聚合所有客户端的IP地址和名称
let clientsInfo = [];
// 聚合所有客户端的socket
let sockets = [];
let options = {
    key: fs.readFileSync('openssl/server-key.pem'),
    cert: fs.readFileSync('openssl/server-cert.pem'),
    ca: [fs.readFileSync('openssl/ca-cert.pem')],
    // 关闭客户端认证
    requestCert: true,
    rejectUnauthorized: false
};

let server = tls.createServer(options, (socket) => {
    let cnt = 1;
    let askForPwd = 0;
    let clientName = 'UNKNOWN';
    socket.setEncoding('utf8');
    socket.write("Welcome!\n");
    socket.on('data', (data) => {
        let dataString = data.toString();
        // 客户端第一次发送信息给服务器，申明自己的身份
        if (cnt === 1) {
            clientName = dataString;
            // 将新连入的客户端放进sockets数组
            sockets.push(socket);
            let certainClientInfo = {};
            certainClientInfo.socket = socket;
            certainClientInfo.IP = socket.remoteAddress;
            certainClientInfo.Name = clientName;
            clientsInfo.push(certainClientInfo);
            console.log(`Remote connection[${clientName}] connected(${socket.authorized ? 'Authorized' : 'Unauthorized'})`);
            console.log(`Data have been ${socket.encrypted ? 'encrypted' : 'unencrypted'}`);
            // 客户端之后发送的信息由服务器进行处理并返回，且将信息写入log文件
        } else {
            let logString = `Connection[${clientName}] sent:"${dataString}"[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
            if (dataString === 'open') {
                logString = `${logString} Request Allow\n`;
                console.log(`Got[${clientName}]: ${dataString}`);
                socket.write('1');
                // 管理端可以通过发送指定消息操作任意客户端
            } else if (clientName === 'ADMIN' && socket.authorized) {
                console.log(`Got[${clientName}]: ${dataString}`);
                // 若下一次数据监听为等待密码
                if (askForPwd) {
                    // 密码正确，执行开门操作
                    if (dataString === '123456') {
                        socket.write('PASSWORD CORRECT!Command Allow');
                        console.log('PASSWORD CORRECT!Command Allow');
                        clientsInfo.forEach((item, index) => {
                            if ('TEST-CLIENT' === item.Name) {
                                logString = `${logString} Request Allow\n`;
                                sockets[index].write('1');
                            }
                        })
                    } else {
                        socket.write('PASSWORD ERROR!Command Deny');
                        console.log('PASSWORD ERROR!Command Deny');
                        logString = `${logString} Request Deny\n`;
                    }
                    askForPwd = 0;
                }
                // 将管理端发送来的消息以'|'符号进行分割存入数组，如TEST-CLIENT|OPEN
                let adminArray = dataString.split('|');
                clientsInfo.forEach((item, index) => {
                    if (adminArray[0] === item.Name) {
                        if (adminArray[1] === 'OPEN') {
                            // logString = `${logString} Request Allow\n`;
                            // sockets[index].write('1');
                            socket.write('Enter the password for command:');
                            console.log(`Waiting for the password to manage ${item.Name}...`);
                            logString = `${logString} Response for password\n`;
                            askForPwd = 1;
                        } else {
                            logString = `${logString} Request Deny\n`;
                        }
                    }
                })
            } else {
                logString = `${logString} Request Deny\n`;
                console.log(`Unexpected data[${clientName}]: ${dataString}`);
                socket.write('2');
            }
            // 将socket可读流中的信息处理后写入log文件
            fs.appendFile('log.txt', logString, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Data have been wrote in ./log.txt');
                }
            })
        }
        cnt++;
    });
    // 所有端端保持连接
    socket.setKeepAlive(true);
    // 一旦客户端断开连接便发出警告
    socket.on('close', () => {
        let index = sockets.indexOf(socket);
        sockets.splice(index, 1);
        clientsInfo.splice(index, 1);
        console.log(`WARNING:Connection[${clientName}] has closed,LOSING CONTROL...`);
    });
    // 客户端强制关闭时接住error不会导致服务器崩溃
    socket.on('error', (err) => {
        console.log(`Connection[${clientName}] error: ${err.message}`);
    })
});

server.on('error', (err) => {
    console.log(`Server error: ${err.message}`);
});

server.on('close', () => {
    console.log('Server closed');
})
;

server.listen(8080, () => {
    console.log('Server bound');
});