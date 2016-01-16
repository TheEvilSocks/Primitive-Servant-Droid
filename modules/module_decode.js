var uidFromMention = /<@([0-9]+)>/;
module.exports = {
  lastTime: 0,
  cooldown: 500,
  description:"decode <base64> <text> -  Decode from something to normal text",
  permission: {
    onlyMonitored: true
  },
  action: function(args, e) {
	  if(args.length < 2){
		  e.bot.sendMessage({
			  to: e.channelID,
			  message: "**Usage:**\n" + module.exports.description
		  });
		  return;
	  }
     if (args[0].toLowerCase() == "base64") {
		var toDecode = "";
		for(i=1;i<args.length;i++){
			toDecode += args[i] + " ";
		}
		toDecode = toDecode.substring(0,toDecode.length-1);
		var encoded= new Buffer(toDecode,'base64').toString('utf8');
      e.bot.sendMessage({
        to: e.channelID,
        message: "<@" + e.userID + ">\n```" + encoded + "```"
      });
    } 
  }
}