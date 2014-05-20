
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var push = require('./push');
var mysql = require('mysql');
var datahandler = require('./modules/datahandler.js');
var userHandler = require('./modules/userhandler.js');

var app = express();

// all environments
app.set('port', 8080);//process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', routes.index);
app.get('/users', user.list);

app.post('/signup', userHandler.signup);
app.post('/register', push.regist);
app.get('/send', push.send_push);

app.post('/data', datahandler.collect);
app.post('/appdata/append', datahandler.GetAppData);
app.get('/appdata/append', datahandler.GetAppData);
//app.get('/data', datahandler.collect);

http.createServer(app).listen(app.get('port'), '192.168.0.5', function(){
  console.log('Express server listening on port ' + app.get('port'));
});
