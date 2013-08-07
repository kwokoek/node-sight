/*.
 * Node runtime sight -> diagnostic middleware to help get visibility into node sessions, such as url tracing.
 */
var uuid = require('node-uuid');
var util = require('util');

// Site configurations
var sight_url = "/sight_diagnostic";
var sight_handlers = [show_url_trace];
var url_count_map ={};

// Cookie keys
var SIGHT_COOKIE = "sight_";
var SIGHT_SESSION = "session";
var SIGHT_ENABLED = "enabled";

/** 
 * creation of new Sight instance
 **/
module.exports.configureSight = function(sightBaseUrl, handlers){
  sightBaseUrl = cleanBaseUrl(sightBaseUrl);

  // clean base url cannot be empty or pointing to the root
  if((!sightBaseUrl)||(sightBaseUrl == '/')) {
    var msg = util.format("WARNING : Sight module ignoring invalid base siteUrl:%s",util.inspect(sightBaseUrl));
    util.log(msg);
    util.log("Using site url: "+sight_url);
  } else {
    sight_url = sightBaseUrl;
  }

  if((handlers)&&(handlers.length > 0)) {
    util.log("Overriding sight handlers");
    sight_handlers = handlers;
  }
};


/**
 * Helper to put the inbound base sight url in a known format.
 * Url is used to configure sight
 **/
function cleanBaseUrl(baseUrl) {
  if(!baseUrl) {
    return null;
  }

  baseUrl = baseUrl.trim();
  if (baseUrl.substring(0, 1) != '/') { 
    baseUrl = "/"+baseUrl;
  }

  return baseUrl;
}


/**
 * Middleware that traps requests to the sight diagnostics page, else ignores request.
 * The diagnostic handler allows adding of any cookie value for node visibility.
 * Any cookie added will be pre-pended with a 'sight_' value to explicitly mark it as such
 **/
module.exports.sight_handler = function(req, res, next){
  var session_key = SIGHT_COOKIE + SIGHT_SESSION;
  if(req.path === sight_url) {
    for(var query_key in req.query){
      var diag_key = SIGHT_COOKIE+ query_key;
      util.log(util.format("Sight Diagnostic setting cookie %s = %s",query_key,req.query[query_key]));
      res.cookie(diag_key,req.query[query_key]);
    }

    // Set a session key if one is not already set
    if ((!req.cookies) || (!req.cookies[session_key])) {
      var gen_session_id = uuid.v4();
      res.cookie(session_key,gen_session_id);
    }

    res.redirect(301, '/');
    return;
  }

  if(req.cookies === undefined) {
    util.log("Node sight plugin requires connect cookie parser middleware. "+
      "Example usage: app.use(express.cookieParser());");
  } else {

    var sight_enabled = req.cookies[SIGHT_COOKIE+SIGHT_ENABLED];
    if((sight_enabled !== null) && (sight_enabled === 'true')) {
      var session_id = req.cookies[session_key];

      for (i = 0; i < sight_handlers.length; i++) {
            sight_handlers[i](session_id,req,res);
      }
    }
  }

  next();
};

exports.show_url_trace = show_url_trace;
function show_url_trace(session_id, req, res){
  /*
  * Will log out any request with the passed in session id 
  */

  util.log(util.format("Sight Trace %s: %s",session_id, req.url));

}

module.exports.show_url_count = function(session_id, req, res){
  /*
   * The will run a per session unique url count, logging to std out
  */

  var countEntry = getUrlCountEntry(session_id,req.url);
  countEntry.count = countEntry.count + 1;
  util.log(util.format("Sight Counter %s: %s with count %s",session_id, req.url,countEntry.count));

};

function getUrlCountEntry(session_id,url) {
  if(!(session_id in url_count_map)){
    url_count_map[session_id] = {};
  }
  if(!(url in url_count_map[session_id])) {
    url_count_map[session_id][url] = {'count':0};
  }
  return url_count_map[session_id][url];
}

