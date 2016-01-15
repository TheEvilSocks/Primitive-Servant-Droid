var uidFromMention = /<@([0-9]+)>/;
module.exports = {
  lastTime: 0,
  cooldown: 500,
  description:"id <me/channel/server/user> - Shows the ID of the channel or user",
  permission: {
    onlyMonitored: true
  },
  action: function(args, e) {
	  if(args[0] == undefined){
		  e.bot.sendMessage({
			to: e.channelID,
			message: "<@" + e.userID + "> => `" + e.userID + "`"
		});
	  }else if (args[0].toLowerCase() == "me") {
      e.bot.sendMessage({
        to: e.channelID,
		message: "<@" + e.userID + "> => `" + e.userID + "`"
      });
    
    }else if(args[0].toLowerCase() == "channel"){
		e.bot.sendMessage({
        to: e.channelID,
        message: "<#" + e.channelID + "> => `" + e.channelID + "`"
      });
	}else if(args[0].toLowerCase() == "server"){
		e.bot.sendMessage({
        to: e.channelID,
        message: "Server ID => `" + e.bot.serverFromChannel(e.channelID) + "`"
      });
	}else if(args[0].indexOf("<@") > -1 && args[0].indexOf(">") > -1){
		e.bot.sendMessage({
        to: e.channelID,
        message: args[0] + " => `" + args[0].substring(2,args[0].length-1) + "`"
      });
		
	}else{
		e.bot.sendMessage({
        to: e.channelID,
        message: "`" + args[0].replace("`", "'") + "` is not a valid parameter."
      });
	}
  }
}


