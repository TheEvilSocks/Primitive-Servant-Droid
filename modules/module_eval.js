var uidFromMention = /<@([0-9]+)>/;
module.exports = {
  lastTime: 0,
  cooldown: 500,
  description:"eval <code> - Evaluate your code",
  permission: {
	group:["root"],
    onlyMonitored: true
  },
  action: function(args, e) {
    	var arg = "";
		for(i=1;i<args.length;i++){
			arg += args[i] + " ";
		}
		arg = arg.substring(0,arg.length-1);
		e.bot.sendMessage({
			to: e.channelID,
			message: "```" + arg + "```"
		});
  }
}