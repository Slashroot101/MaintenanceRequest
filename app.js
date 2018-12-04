var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');
let config = require(`./config`);
var indexRouter = require('./src/routes');
var usersRouter = require('./src/routes/users');
var changeRequestRouter = require('./src/routes/changeRequest');
let bodyParser = require('body-parser')
let fs = require(`fs`);
mongoose.set(`debug`, true)

var privateKey = fs.readFileSync('./forge.slashroot.xyz.key').toString();
var certificate = fs.readFileSync('./forge.slashroot.xyz.crt').toString();
var interCertificate = fs.readFileSync('./forge.slashroot.xyz.crt').toString();

let mongoConnection = {
  user: config.mongo.username,
  password: config.mongo.password,
  authdb: config.mongo.authdb
}

mongoose.connect(config.mongo.host, {auth:mongoConnection});

process.on(`uncaughtException`, console.log)

var app = express();
let server = require('http').createServer(app);
let io = require(`socket.io`)(server);

        var options = {
                key: privateKey,
		port: `8080`,
                cert: certificate,
		address: config.ip,
		ca: interCertificate
        };
server.listen(8080, config.ip);

io.on('connection', function(client){
  let clients = [];
  client.on('join', function(data){
    clients.push({
      id: client.id,
      floor: data
    });
  });

  client.on('disconnect', function(data){
    for(let i = 0; i < clients.length; i++){
      if(clients[i].id === client.id){
        clients.splice(i);
        console.log(clients);
      }
    }
  });
});

app.io = io;


app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/change-request', changeRequestRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err)
  res.render('error');
});

module.exports = app;
