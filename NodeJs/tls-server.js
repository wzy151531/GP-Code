let tls = require('tls');
let fs = require('fs');
let file = fs.createWriteStream('./log.txt');
let moment = require('moment');
moment.locale('zh-cn');
// 连入tls服务器的客户端IP地址和名称
let clientsInfoList = [{IP: '::ffff:192.168.1.16', Name: 'ADMIN'}, {IP: '::ffff:192.168.1.12', Name: 'TEST-CLIENT'}];
let clientsInfo = [];
// 聚合所有客户端
let sockets = [];
let options = {
    key: fs.readFileSync('openssl/server-key.pem'),
    cert: fs.readFileSync('openssl/server-cert.pem'),
    ca: [fs.readFileSync('openssl/server-cert.pem')],
    // 关闭客户端认证
    requestCert: false,
    rejectUnauthorized: false
};

let server = tls.createServer(options, function (socket) {
    let clientName = 'UNKNOWN';
    clientsInfoList.forEach(function (item) {
        if (socket.remoteAddress === item.IP) {
            clientName = item.Name;
        }
    });
    // 将新连入的客户端放进sockets数组
    sockets.push(socket);
    let certainClientInfo = {};
    certainClientInfo.socket = socket;
    certainClientInfo.IP = socket.remoteAddress;
    certainClientInfo.Name = clientName;
    clientsInfo.push(certainClientInfo);
    console.log(`Remote connection[${clientName}] connected(${socket.authorized ? 'Authorized' : 'Unauthorized'})`);
    console.log(`Data have been ${socket.encrypted ? 'encrypted' : 'unencrypted'}`);
    socket.setEncoding('utf8');
    socket.write("Welcome!\n");
    socket.on('data', function (data) {
        let dataString = data.toString();
        let logString = `Connection[${clientName}] sent:"${dataString}"[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
        if (dataString === 'open') {
            logString = `${logString} Request Allow\n`;
            console.log(`Got[${clientName}]: ${dataString}`);
            socket.write('1');
            // 管理端可以通过发送指定消息操作任意客户端
        } else if (clientName === 'ADMIN') {
            console.log(`Got[${clientName}]: ${dataString}`);
            // 将管理端发送来的消息以'|'符号进行分割存入数组，如TEST-CLIENT|OPEN
            let adminArray = dataString.split('|');
            //console.log(adminArray);
            clientsInfo.forEach(function (item, index) {
                if (adminArray[0] === item.Name) {
                    if (adminArray[1] === 'OPEN') {
                        sockets[index].write('1');
                    }
                }
            })
        } else {
            logString = `${logString} Request Deny\n`;
            console.log(`Unexpected data[${clientName}]: ${dataString}`);
            socket.write('2');
        }
        // 将客户端socket可读流中的信息处理后写入log文件
        file.write(logString, 'utf8', function () {
            console.log('Data have been wrote in ./log.txt');
        })
    });
    // 非管理端保持连接
    if (clientName !== 'ADMIN') {
        socket.setKeepAlive(true);
    }
    // 一旦客户端断开连接便发出警告
    socket.on('close', function () {
        let index = sockets.indexOf(socket);
        sockets.splice(index, 1);
        clientsInfo.splice(index, 1);
        console.log(`WARNING:Connection[${clientName}] has closed,LOSING CONTROL...`);
    });
});

server.on('error', function (err) {
    console.log(`Server error:${err.message}`);
});

server.on('close', function () {
    console.log('Server closed');
});

server.listen(8080, function () {
    console.log('Server bound');
});