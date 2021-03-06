var uidFromMention = /<@([0-9]+)>/;
var md5 = require("../node_modules/md5");
module.exports = {
  lastTime: 0,
  cooldown: 500,
  description:"encode <base64/md5> <text> - Encode some text",
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
    if (args[0].toLowerCase() == "md5") {
		var toEncode = "";
		for(i=1;i<args.length;i++){
			toEncode += args[i] + " ";
		}
		toEncode = toEncode.substring(0,toEncode.length-1);

      e.bot.sendMessage({
        to: e.channelID,
        message: "<@" + e.userID + ">\n```" + md5(toEncode) + "```"
      });
    } else if (args[0].toLowerCase() == "base64") {
		var toEncode = "";
		for(i=1;i<args.length;i++){
			toEncode += args[i] + " ";
		}
		toEncode = toEncode.substring(0,toEncode.length-1);
		var encoded= new Buffer(toEncode).toString('base64');
      e.bot.sendMessage({
        to: e.channelID,
        message: "<@" + e.userID + ">\n```" + encoded + "```"
      });
    }else if(args[0].toLowerCase() == "binary"){
      var toEncode = args.splice(1).join(" ");
      var encoded = ""
      for (i=0; i < toEncode.length; i++) {
        var curBinary = "00000000";
        curBinary += toEncode.charCodeAt(i).toString(2);
        curBinary = curBinary.substring(curBinary.length-8);
     	  encoded += curBinary;
      }
    e.bot.sendMessage({
      to: e.channelID,
      message: "<@" + e.userID + ">\n```" + encoded + "```"
    });
    }
  }
}
