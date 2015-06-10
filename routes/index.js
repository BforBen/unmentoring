var mcapi = require('mailchimp-api'),
    _ = require('underscore-node');

exports.index = function(req, res){
  mc.helper.ping(function(data) {
    
  var listId = process.env.MC_LISTID;
  var segmentId = process.env.MC_SEGMENTID;
  
    mc.lists.list({filters:{list_id: listId, exact: true}}, function(listData) {
      var list = listData.data[0];
      mc.lists.members({id: list.id, opts: { segment : { saved_segment_id: segmentId } } }, function(memberData) {
        
        var members = memberData.data;
        
        var matched = [];
        
        var count = _.size(members);
        
        if (count % 2 != 0)
        {
          throw "Not an even number of members";
        }
        
        var toMatch = _.pluck(members, 'id');

        _.each(
          _.initial(members.concat(), count / 2),
            function(member) {
              var userHistory = JSON.parse(member.merges.UMHISTORY || '[]');
              // Add self
              userHistory.push(member.id);
              var match = _.findWhere(members, { id: _.sample(_.difference(toMatch, userHistory)) });
              matched.push({ "a": member, "b": match});
              // Remove whoever we have matched
              toMatch = _.without(toMatch, match.id, member.id);
            });
            
        res.render('list', { title: 'LocalGov Digital Unmentoring Matcher', matches: matched });
        
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