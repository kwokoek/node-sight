
# But it works at my desk

Running connect/express based application is fast, and easy to
configure. Once your app is up and running, debugging can get
challenging.

The most difficult issues to solve are the distinct user based
failures. These are issues that only show up in a production
environment, for a certain set of users.

We need a way to dynamically debug individual user seesions, while on a
production environment.. sight to the rescue.

# How does Sight help?

sight is a connect/express middleware plugin, which allows a distinct
per session view of web activity. 

The session visibility is turned on by a cookie, and uniquely identified
in your logs by an identifier for the life of that session.

There are built in plugins from sight to do some core logging to stdout,
but can easily be configured to add in your own plugins for anything you
can think of!

To start a session, have the target user hit a specific endpoint to drop
a cookie. This endpoint can be used enable or disable sight for a
session.

```
http://localhost:3000/sight_diagnostic?enabled=true&session=user1
```
 
This would give log entries such as this:

  5 Aug 14:10:39 - Sight Trace user1: /javascripts/two.js

Now use that 'live' feedback data from that problematic user session to diagnose the
failure scenario, while not affecting any other user session.

# Setup

The first step is to install the package:

'npm install sight'

sight requires the connect 'cookieParser' middleware, so that must be
included before the sight middleware is registered.

  	var sight=require('sight');
	
  	//.... setup express site here ...
	
    // Cookie Parser is required middleware
    app.use(express.cookieParser());
    // Add in the main sight handler
    app.use(sight.sight_handler);

sight defaults to include a per request logger to console out.
See <Custom site plugins> for advanced configuration options.

# Usage

Once the middleware is configured, you can turn on sight session
tracking by hitting the configured sight url (defaulting to
/sight_diagnostic).


```
http://localhost:3000/sight_diagnostic?enabled=true&session=user1
```

To turn off the sight handling for a session, either clear the cookies
on the client side or disable sight for this session:

```
http://localhost:3000/sight_diagnostic?enabled=false
```

To see a fully configured and running sample, fire up the example
express application under the examples folder.

# Custom sight plugins

To add a custom sight plugin, all that is needed is a function that
takes a session id, the request object , and the response object.
The registered plugins are chained together, allowing multiple actions for each sight session.

    // custom diagnostic for sight to use
    function my_sight_handler(session_id,req,res){
      // Add custom handler here!
      // Extra logs, email, post to another system, add cookies..all good!
      util.log("my_sight_handler for id: "+session_id+" on req: "+req.path);
    }

The complete plugin chain must then be registered on the configuration
method.

    // If you want to override the default url end point and handlers, call the configure method 
    // This case we will add 3 handlers:
    //  1. sight url trace
    //  2. sight url counter
    //  3. Your own custom handler
    sight.configureSight('sight_diagnostic',[sight.show_url_trace,sight.show_url_count,my_sight_handler]);

# Anything else?

The sight diagnostic endpoint will take any query params, and drop them
as cookies with a 'sight_' prefix. 
Leverage this to drop your own debuging cookies to use in your sight
handlers orleverage on the client side for some more custom diagnostics.

```
http://localhost:3000/sight_diagnostic?my_tracker=verbose
```

Drops a cookie 'sight_my_tracker' with a value of verbose.
