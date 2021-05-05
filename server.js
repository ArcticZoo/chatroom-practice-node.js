var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = process.env.PORT || 8000,
    users = [],
    //这两个变量是用作文件传输
    dl = require('delivery'),
    fs  = require('fs');
//这儿指定index的位置
app.use('/', express.static(__dirname + '/www'));
server.listen(port, function() {
    console.log("App is running on port " + port);
});
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

    delivery.on('receive.success',function(file){
    fs.writeFile(file.name,file.buffer, function(err){
      if(err){
        console.log('File could not be saved.');
      }else{
        console.log('File saved.');
      };
    });
  });
  //文件从服务器到客户端
   delivery.on('delivery.connect',function(delivery){

    delivery.send({
      name: 'sample-image.jpg',
      path : './sample-image.jpg',
      params: {foo: 'bar'}
    });

    delivery.on('send.success',function(file){
      console.log('File successfully sent to client!');
    });

  });
});