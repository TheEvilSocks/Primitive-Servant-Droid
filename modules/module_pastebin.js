var uidFromMention = /<@([0-9]+)>/;
var superAuth = require("../configs/superAuth.json");
var PastebinAPI = require('pastebin-js'),
    pastebin = new PastebinAPI({
		"api_dev_key": superAuth.pastebin.api_key,
		"api_user_name": superAuth.pastebin.username,
		"api_user_password": superAuth.pastebin.password
		
	});
module.exports = {
  lastTime: 0,
  cooldown: 1000,
  description: "pastebin get <id> - Get the contents of a pastebin link.\n pastebin create <data> - Put some data onto pastebin!",
  permission: {
    onlyMonitored: true
  },
  action: function(args, e) {
    if(args.length < 2){
		return;
	}
    if (args[0].toLowerCase() == "get") {
		pastebin.getPaste(args[1]).then(function(data){
			if((data.length + 3 + e.userID.length)> 2000)
				data = data.substring(0,2000)
		  e.bot.sendMessage({
			to: e.channelID,
			message: "<@" + e.userID + ">\n```" + data + "```"
		  });
		}).fail(function(err){
			e.bot.sendMessage({
			to: e.channelID,
			message: "**An error occured when getting the paste:**\`" + err + "`"
		  });
		});
    
    }else if(args[0].toLowerCase() == "put" || args[0].toLowerCase == "create"){
		pastebin
		  .createPaste(args.splice(1).join(" "), "Powered by Primitive Servant Droid")
		  .then(function (data) {
		  e.bot.sendMessage({
			to: e.channelID,
			message: "<@" + e.userID + ">\ Your pastebin link is http://pastebin.com/" + data
		  });
		  })
		  .fail(function (err) {
			e.bot.sendMessage({
			to: e.channelID,
			message: "**An error occured when getting the paste:**\`" + err + "`"
		  });
		  })
	}
  }
}