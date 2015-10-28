var express           = require('express');
var app               = express();
var path              = require('path');
var server            = require('http').createServer(app);
var io                = require('socket.io').listen(server);
var handlebar         = require('express3-handlebars').create({defaultLayout:'master'});
var routes            = require('./routes/index');
var unames            =[];


// view engine setup
app.engine('handlebar',handlebar.engine);
app.set('view engine','handlebar');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
io.sockets.on('connection',function(socket){
  socket.on('send message',function(data) {
    io.sockets.emit('new message',{msg:data,user:socket.username});
  });

  socket.on('new user',function(data,callback){
    console.log(data);
    if(unames.indexOf(data) != -1){
      callback(false);
    }else{
      callback(true);
      socket.username = data;
      unames.push(socket.username);
      updateUsername();
    }
  });
  socket.on('disconnect',function(data){
      if(!socket.username) return;
      unames.splice(unames.indexOf(socket.username),1);
      updateUsername();
  });
  function updateUsername(){
    console.log(unames);
    io.sockets.emit('usernames',unames);
  }




});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen(8080, function(){
  console.log('listening on *:8080');
});

module.exports = app;
