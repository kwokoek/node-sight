/**
 * Sight module usage example. See 'SIGHT BLOCK' comment blocks for sight usage.
 *
 * Once app is running, hit this end point from a browser:
 * http://localhost:3000/sight_diagnostic?enabled=true&session=user1
 * 
 * Now check the server window to see sight plugin logs.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , util = require('util');


var sight = require('../lib/sight');


var app = express();
app.configure(function(){

  /****  SIGHT BLOCK  *******************/

  // If you want to override the default url end point and handlers, call the configure method 
  // This case we will add 3 handlers:
  //  1. sight url trace
  //  2. sight url counter
  //  3. Your own custom handler
  sight.configureSight('sight_diagnostic',[sight.show_url_trace,sight.show_url_count,my_sight_handler]);

  /*************************************/

  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hjs');
  app.use(express.favicon());
  //app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());


  /****  SIGHT BLOCK  *******************/

  // Cookie Parser is required middleware
  app.use(express.cookieParser());
  // Add in the main sight handler
  app.use(sight.sight_handler);

  /*************************************/


  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req,res) {
  res.render("index",{'title':'index page'});
});

app.get('/dogs', function(req,res) {
  res.render("dogs",{'title':'dogs page'});
});


http.createServer(app).listen(app.get('port'), function(){
  util.log("Express server listening on port " + app.get('port'));
});


/****  SIGHT BLOCK  *******************/
// custom diagnostic for sight to use
function my_sight_handler(session_id,req,res){
  // Add custom handler here!
  // Extra logs, email, post to another system, add cookies..all good!
  util.log("my_sight_handler for id: "+session_id+" on req: "+req.path);
}
/*************************************/
