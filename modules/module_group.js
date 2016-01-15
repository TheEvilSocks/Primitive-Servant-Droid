var uidFromMention = /<@([0-9]+)>/;
var config = require('../configs/config.json');
module.exports = {
  description:"group let  <groupname> <username> - Adds someone into a group\ngroup kick <groupname> <username> - Kick someone from a group\ngroup list - List all groups",
    permission: {
        uid: [config.masterID],
        group: ["root"],
        onlyMonitored: true
    },
    action: function(args, e) {
        if(args[0].toLowerCase() == "let") {
            if(!uidFromMention.test(args[2])) {
                e.bot.sendMessage({
                    to: e.channelID,
                    message: "<@" + e.userID + "> that's not a valid mention!"
                });
                return;
            }
            var group = args[1];
            var user = uidFromMention.exec(args[2])[1];
            if(e.db.groups[group]) {
                if(e.db.isUserInGroup(user, group)) {
                    e.bot.sendMessage({
                        to: e.channelID,
                        message: "<@" + e.userID + "> user " + args[2] + " (" + user + ")  already in group `" + group + "`"
                    });
                    return;
                }
            } else {
                e.bot.sendMessage({
                    to: e.channelID,
                    message: "<@" + e.userID + "> no group `" + group + "`"
                });
                return;
            }
            e.db.groups[group].push(user);
            e.bot.sendMessage({
                to: e.channelID,
                message: "<@" + e.userID + "> user " + args[2] + " (" + user + ")  added to `" + group + "`"
            });
            e.db.saveConfig();
        } else if(args[0].toLowerCase() == "kick") {
            var group = args[1];
            var user = uidFromMention.exec(args[2])[1];
            if(e.db.groups[group]) {
                if(!e.db.isUserInGroup(user, group)) {
                    e.bot.sendMessage({
                        to: e.channelID,
                        message: "<@" + e.userID + "> user " + args[2] + " (" + user + ")  is not in group `" + group + "`"
                    });
                    return;
                }
            } else {
                e.bot.sendMessage({
                    to: e.channelID,
                    message: "<@" + e.userID + "> no group `" + group + "`"
                });
                return;
            }
            e.db.groups[group].splice(e.db.groups[group].indexOf(user), 1);
            e.bot.sendMessage({
                to: e.channelID,
                message: "<@" + e.userID + "> user " + args[2] + " (" + user + ")  removed from `" + group + "`"
            });
            e.db.saveConfig();
        } else if(args[0].toLowerCase() == "get"){
			if(args.length != 2)
				return;
			var userInGroups = [];
			for(var grp in e.db.groups){
				//console.log(grp);
				if(e.db.groups[grp].indexOf(args[1].replace("<@","").replace(">","")) > -1){
					userInGroups.push(grp);
				}

			}			
			if(userInGroups.length >0){
				e.bot.sendMessage({
					to: e.channelID,
					message: args[1] + " is in these groups: \n`" + userInGroups + "`"
				});
			}else{
				e.bot.sendMessage({
					to: e.channelID,
					message: args[1] + " is not in any groups."
				});
			}
			
		}else if(args[0].toLowerCase() == "debug") {
            console.log(e.db.groups);
        } else if(args[0].toLowerCase() == "list") {
            var str = "**Group list:**\n\n";
            var g = Object.keys(e.db.groups)
            for(var i = 0; i < g.length; i++) {
                str += "`" + g[i] + "`: "
                for(j = 0; j < e.db.groups[g[i]].length; j++) {
                    str += " <@" + e.db.groups[g[i]][j] + ">";
                }
                str += "\n";
            }
            e.bot.sendMessage({
                to: e.channelID,
                message: str
            });
        }
    }
}