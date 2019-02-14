var server = require("net").createServer();
var port = 8080;
server.on('listening', function() {
    console.log('Server is listening on port', port);
});
server.on('connection', function(socket) {
    console.log('Server has a new connection');
    socket.setEncoding('utf8');
    socket.write('Hello!\n');
    socket.on('data', function(data) {
        var dataString = data.toString();
        if(dataString === 'open'){
            console.log('got:', dataString);
            // 反馈回客户端
            socket.write('1');
        }else{
            console.log('unexpected data:', dataString);
            socket.write('2');
        }
    });
    // 保持连接
    socket.setKeepAlive(true);
});
server.on('close', function() {
    console.log('Server is now closed');
});
server.on('error', function(err) {
    console.log('Error occurred:', err.message);
});
server.listen(port);