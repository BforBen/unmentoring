var express = require('express')
  , routes = require('./routes')
  , lists = require('./routes/lists')
  , http = require('http')
  , mcapi = require('mailchimp-api');

var app = express();

// set MailChimp API key here
mc = new mcapi.Mailchimp('123');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', routes.index);
app.get('/lists', lists.list);
app.get('/lists/:id', lists.view);
app.post('/lists/:id/subscribe', lists.subscribe);

app.use(function(req, res, next){
    res.locals.error_flash = req.session.error_flash;
    req.session.error_flash = false;
    res.locals.success_flash = req.session.success_flash;
    req.session.success_flash = false;
    next();
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});