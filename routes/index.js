var mcapi = require('mailchimp-api');

exports.index = function(req, res){
  mc.helper.ping(function(data) {
    
  var listId = process.env.MC_LISTID;
  var segmentId = process.env.MC_SEGMENTID;
  
    mc.lists.list({filters:{list_id: listId, exact: true}}, function(listData) {
      var list = listData.data[0];
      mc.lists.members({id: list.id, opts: { segment : { saved_segment_id: segmentId } } }, function(memberData) {
        res.render('list', { title: list.title, list: list, members:memberData.data });
      }, function (err) {
        console.log(err);
        if (err.name == "List_DoesNotExist") {
          res.locals.error_flash = "The list does not exist";
        } else if (err.error) {
          res.locals.error_flash = err.code + ": " + err.error;
        } else {
          res.locals.error_flash = "An unknown error occurred";
        }
        res.render('error', { title: 'Home' });
      });
    });
    
    
  }, function(err) {
    console.log(err);
    if (err.name == 'Invalid_ApiKey') {
      res.locals.error_flash = "Invalid API key. Set it in app.js";
    } else if (err.error) {
      res.locals.error_flash = err.code + ": " + err.error;
    } else {
      res.locals.error_flash = "An unknown error occurred";
    }
    res.render('error', { title: 'Home' });
  });
};