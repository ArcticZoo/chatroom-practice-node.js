var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
    //这两个变量是用作文件传输
//这儿指定index的位置
app.use('/', express.static(__dirname + '/www'));
server.listen(process.env.PORT || 3000);//heroku专用接口
console.log('listening on');
//调试用端口
io.sockets.on('connection', function(socket) {
    var delivery = dl.listen(socket);
    //新用户登陆
    console.log('success connection')
    //调试 返回给控制台
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //离开的时候
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //传输消息
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
        console.log('Post message')
    });
    //传输文件


  });
});