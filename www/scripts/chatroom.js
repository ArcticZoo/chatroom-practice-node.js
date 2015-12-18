window.onload = function () {
  var hichat = new HiChat();
  hichat.init();
};
//类
var HiChat = function () {
  this.socket = null;
};
//原型
HiChat.prototype = {
  init: function () {
    var that = this;
    //建立到服务器的socket连接
    this.socket = io.connect();
    //当链接已经建立后执行
    this.socket.on('connect', function () {
      document.getElementById('info').textContent = '给自己取一个昵称吧 :)';
      document.getElementById('nickWrapper').style.display = 'block';
      document.getElementById('nicknameInput').focus();
    });
    this.socket.on('nickExisted', function () {
      document.getElementById('info').textContent = '! 昵称已经被占用';
    });
    this.socket.on('loginSuccess', function () {
      document.title = 'chatroom | ' + document.getElementById('nicknameInput').value;
      document.getElementById('loginWrapper').style.display = 'none';
      document.getElementById('messageInput').focus();
    });
    this.socket.on('error', function (err) {
      if (document.getElementById('loginWrapper').style.display == 'none') {
        document.getElementById('status').textContent = '失去链接 :(';
      } else {
        document.getElementById('info').textContent = '失去链接 :(';
      }
    });
    //收到系统消息时执行
    this.socket.on('system', function (nickName, userCount, type) {
      var msg = nickName + (type == 'login' ? ' joined' : ' left');
      that._displayNewMsg('system ', msg, 'red');
      document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
    });
    //收到新消息的时候执行
    this.socket.on('newMsg', function (user, msg, color) {
      that._displayNewMsg(user, msg, color);
    });
          //文件从客户端传送到服务器
         // var socket = io.connect('localhost:3000'); 这个貌似是重复定义了 因为之前已经定义了this.socket监听local3000
              var delivery = new Delivery(this.socket);
      delivery.on('delivery.connect', function (delivery) {
        $('input[type=submit]').click(function (evt) {
          var file = $('input[type=file]') [0].files[0];
          var extraParams = {
            foo: 'bar'
          };
          delivery.send(file, extraParams);
          evt.preventDefault();
        });
      });
      delivery.on('send.success', function (fileUID) {
        console.log('file was successfully sent.');
      });
      //之前这一段一直出问题，貌似是因为没有弄懂javascript的对象这一块。之前已经定义了socket这个对象。在这儿又定义了delivery对象。之所以这么弄，是因为调用了这个库
    
    //文件从服务器到客户端
     delivery.on('receive.start',function(fileUID){
      console.log('receiving a file!');
    });

    delivery.on('receive.success',function(file){
      var params = file.params;
      if (file.isImage()) {
        $('img').attr('src', file.dataURL());
      };
    });
    //
    document.getElementById('loginBtn').addEventListener('click', function () {
      var nickName = document.getElementById('nicknameInput').value;
      if (nickName.trim().length != 0) {
        that.socket.emit('login', nickName);
      } else {
        document.getElementById('nicknameInput').focus();
      };
    }, false);
    document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
      if (e.keyCode == 13) {
        var nickName = document.getElementById('nicknameInput').value;
        if (nickName.trim().length != 0) {
          that.socket.emit('login', nickName);
        };
      };
    }, false);
    document.getElementById('sendBtn').addEventListener('click', function () {
      var messageInput = document.getElementById('messageInput'),
      msg = messageInput.value;
      messageInput.value = '';
      messageInput.focus();
      if (msg.trim().length != 0) {
        that.socket.emit('postMsg', msg);
        that._displayNewMsg('me', msg);
        return;
      };
    }, false);
    document.getElementById('messageInput').addEventListener('keyup', function (e) {
      var messageInput = document.getElementById('messageInput'),
      msg = messageInput.value;
      if (e.keyCode == 13 && msg.trim().length != 0) {
        messageInput.value = '';
        that.socket.emit('postMsg', msg);
        that._displayNewMsg('me', msg);
      };
    }, false);
    document.getElementById('clearBtn').addEventListener('click', function () {
      document.getElementById('historyMsg').innerHTML = '';
    }, false);
  },
  _displayNewMsg: function (user, msg) {
    var container = document.getElementById('historyMsg'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8);
    //var完后要用；结束...
    msgToDisplay.style.color = '#757677';
    msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
    container.appendChild(msgToDisplay);
    container.scrollTop = container.scrollHeight;
  },
};
