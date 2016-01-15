var uidFromMention = /<@([0-9]+)>/;
module.exports = {
  lastTime: 0,
  cooldown: 500,
  description:"greet <greeting> - Let the bot greet you. Only for lonely people",
  permission: {
    onlyMonitored: true
  },
  action: function(args, e) {
	  if(args.length != 1)
		  return;
    if (args[0].toLowerCase() == "morning" || (args[0].toLowerCase() == "good" && args[1].toLowerCase() == "morning") ) {
      e.bot.sendMessage({
        to: e.channelID,
        message: "Good morning <@" + e.userID + ">!"
      });
    } else if (args[0].toLowerCase() == "hi" || args[0].toLowerCase() == "hello" || args[0].toLowerCase() == "hey" || args[0].toLowerCase() == "ey" || args[0].toLowerCase() == "yo") {
      e.bot.sendMessage({
        to: e.channelID,
        message: "Hi <@" + e.userID + ">"
      });
    } else if (args[0].toLowerCase() == "bye" || args[0].toLowerCase() == "good bye" || args[0].toLowerCase() == "cya" || args[0].toLowerCase() == "see you") {
      e.bot.sendMessage({
        to: e.channelID,
        message: "I hope to see you soon <@" + e.userID + ">!"
      });
    }else if (args[0].toLowerCase() == "night" || (args[0].toLowerCase() == "good" && args[1].toLowerCase() == "night") ) {
      e.bot.sendMessage({
        to: e.channelID,
        message: "Good night <@" + e.userID + ">!"
      });
    }
  }
}