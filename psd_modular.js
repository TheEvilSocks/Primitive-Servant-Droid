/*Variable area*/
var VERSION = "1.10.2 - InDev | Modular Branch";
var MODE = "production";
process.argv.forEach(function(val, index, array) {
  if (val === "development") MODE = "development";
});
if (MODE === "production") {
  var config = require('./configs/config.json');
  var auth = require('./configs/auth.json'); // or remove ./ for absolute path ^_^
}
else {
  var config = require('./configs/config_dev.json');
  var auth = require('./configs/auth_dev.json'); // or remove ./ for absolute path ^_^
}
var Discordbot = require('discord.io');
var fs = require('fs');
var http = require('http');
var bot = new Discordbot({
  email: auth.email,
  password: auth.password,
  autorun: true
});
var startTime = Math.round(new Date() / 1000);;
var personalRoom = 135424945823023104;
var database = new(require("./database.js"))();
var away = [];
/*----------------------------------------------*/
/*Event area*/
bot.on("err", function(error) {
  console.log(error)
});
bot.on("ready", function(rawEvent) {
  // console.log(config);
  /*bot.editUserInfo({
    password: auth.password, //Required
    username: config.username //Optional
  })*/
  console.log("Connected!");
  console.log("Logged in as: ");
  console.log(bot.username + " - (" + bot.id + ")");
  console.log("Listento: " + config.listenTo);
  bot.setPresence({
    idle_since: null,
    game: config.defaultStatus
  });
  console.log("Version: " + VERSION);
  console.log("Set status!");
});
/*----------------------------------------------*/
var commands = {
  ping: {
	description: "ping - The bot will reply with 'Pong!' and a delay of how long it took",
    
    cooldown: 750,
    lastTime: 0,
	permission: {
      onlyMonitored: true
    },
    action: function(args, e) {
		var curTime = new Date().getTime();
		bot.sendMessage({
				to: e.channelID,
				message: "<@" + e.userID + "> Pong!"
			}, function(response) {
				var nextTime = new Date().getTime();
				var delay = (nextTime - curTime);
				var averageDelay = 0;
				for(i=0;i<e.db.pings.length-1;i++){
					averageDelay+= e.db.pings[i];
				}
				averageDelay = parseFloat(averageDelay/e.db.pings.length-1).toFixed(2);
				
				e.db.pings.push(delay);
				e.db.saveConfig();
			bot.editMessage({
				channel: e.channelID,
				messageID: response.id,
				message: "<@" + e.userID + "> Pong! \nDelay: " + delay + "ms\nAverage delay: " + averageDelay + "ms" 
			});
			
			
			}) ;
      //sendMessages(e, ["<@" + e.userID + "> Pong"]);
      console.log("Ponged <@" + e.userID + ">");
    }
  },
  setstatus: {
    permission: {
      uid: [config.masterID],
      onlyMonitored: true
    },
    action: function(args, e) {
      e.bot.setPresence({
        idle_since: null,
        game: bot.fixMessage(args.join(" "))
      });
    }
  },
  echo: {
	description: "echo [-h] <text> - The bot will repeat your message. -h flag will hide your name",
    permission: {
		group:["root", "dev"],
      onlyMonitored: true
    },
    cooldown: config.globalcooldown,
    lastTime: 0,
    action: function(args, e) {
	  if(args[0].toLowerCase() == "-h"){
		sendMessages(e, [args.join(" ").substring(3)]);
	  }else{
		sendMessages(e, [args.join(" ") + " [<@" + e.userID + ">]"]);
	  }
    }
  },

  help: {
    permission: {
      onlyMonitored: true
    },
    cooldown: config.globalcooldown,
    lastTime: 0,
	description: "help - Shows help for all commands you have permissions for",
    action: function(args, e) {
		
		var userInGroups = [];
		for(var grp in e.db.groups){
			if(e.db.groups[grp].indexOf(e.userID) > -1){
				userInGroups.push(grp);
			}

		}	
		if(userInGroups.length == 0)
			userInGroups.push("");
		var queryResult = [];
		for(var cmd in commands) {
			if(commands[cmd].permission.group != undefined){
				if(commands[cmd].permission.group.indexOf(userInGroups[0]) > -1){
					if(commands[cmd].permission.uid == undefined){
						queryResult.push(cmd);
						//console.log(cmd);
					}
				}
			}else{
				if(commands[cmd].permission.uid == undefined){
					queryResult.push(cmd);
				}
			}
		}
		//console.log(queryResult);
		queryResult = queryResult.sort();
		var helpMessage = "All commands are prefixed with `" + config.listenTo + "`\n**Allowed commands: **\n```";
		for(var cmd in queryResult){
			console.log(queryResult[cmd]);
			if(commands[queryResult[cmd]].description != undefined){
				helpMessage += commands[queryResult[cmd]].description + "\n"
			}else{
				helpMessage += queryResult[cmd] + " - No description\n"				
			}
		}
	  
      sendMessages(e, [helpMessage + 
	  
	  "```\nThere might be some more commands. Either I forgot to add them to this list, or they require certain permissions."]);
    }
  },
  come: {
	  description: "come - Let's the bot listen on the current channel", 
    permission: {
      group: ["root", "dev"],
      onlyMonitored: false
    },
    action: function(args, e) {
      if (e.db.channels.indexOf(e.channelID) != -1) {
        e.bot.sendMessage({
          to: e.channelID,
          message: "I'm already here, dumbdumb!"
        });
        return;
      }
      e.db.channels.push(e.channelID);
      if (database.isUserInGroup(e.userID, "waifu")) {
        e.bot.sendMessage({
          to: e.channelID,
          message: "Your Waifu is here now \u2764"
        });
      } else {
        e.bot.sendMessage({
          to: e.channelID,
          message: "I am here now and will listen to your commands"
        });
      }
      e.db.saveConfig();
    }
  },
  leave: {
	description: "leave - Bot will leave the current channel",
    permission: {
      group: ["root", "dev"],
      onlyMonitored: true
    },
    action: function(args, e) {
      if (e.db.channels.indexOf(e.channelID) == -1) {
        return;
      }
      e.db.channels.splice(e.db.channels.indexOf(e.channelID), 1);
      e.db.saveConfig();
      e.bot.sendMessage({
        to: e.channelID,
        message: "I will leave this channel now"
      });
    }
  },
  json: {
    permission: {
      uid: [config.masterID],
      group: ["root","dev"],
      onlyMonitored: true
    },
    action: function(args, e) {
      sendMessages(e, ["```" + JSON.stringify(e.rawEvent, null, '\t').replace(/`/g, '\u200B`') + "```"]);
    }
  },
  rank: require("./modules/module_group.js"),
  //TODO load a database with multiple greetings, like how images are done but with an array of messages for every greeting
  greet: require("./modules/module_greetings.js"),
  encode: require("./modules/module_encode.js"),
  decode: require("./modules/module_decode.js"),
  id: require("./modules/module_id.js"),
  flip: require("./modules/module_flip.js"), 
  gif: require("./modules/module_gif.js"), 
  remind: require("./modules/module_remind.js"), 
  anime: require("./modules/module_anime.js"), 
  pastebin: require("./modules/module_pastebin.js"), 
  
  description: {
	lastTime: 0,
	cooldown: 500,
	description: "description <command> - Find the description of a command",
	permission: {
		group: ["root"],
		onlyMonitored: true
	},
	action: function(args,e){
		if(args.length == 1){
			if(commands[args[0].toLowerCase()] != undefined){
				sendMessages(e,["**Description of: `" + args[0] + "`**\n ```" + commands[args[0].toLowerCase()].description + "```"]);
			}else{
				sendMessages(e,["There was no description found for `" + args[0] + "` or the command does not exist."]);				
			}
		}

	}
	  
  },
  debug: {
	lastTime: 0,
	cooldown: 500,
	description: "debug",
	permission: {
		group: ["root"],
		onlyMonitored: true
	},
	action: function(args,e){
		if(args.length == 2){
			if(args[0] == "permissions"){
				var queryResult = [];
				for(var cmd in commands) {
					//console.log(cmd,commands[cmd].permission.group);
					if(commands[cmd].permission.group != undefined){
						if(commands[cmd].permission.group.indexOf(args[1]) > -1){
							//console.log(commands[cmd].permission.group.indexOf(args[1] > -1))
							if(commands[cmd].permission.uid == undefined){
								queryResult.push(cmd);
							}
						}
					}else{
						if(commands[cmd].permission.uid == undefined){
							queryResult.push(cmd);
						}
					}
				}
				
				if(queryResult.length > 0){
					sendMessages(e, ["`" + args[1] + "` has access to: \n`" + queryResult.sort() + "`" ]);
				}else{
					sendMessages(e,["`" + args[1] + "` only has access to public commands."]);
				}
				
			}
		}

	}
  }, 
  
  cake:{
  lastTime: 0,
  cooldown: 500,
  description:"cake - CAKE",
	  permission: {
      group: ["root","dev", "cake"],
		  onlyMonitored: true
	  },
	  action: function(args, e){
		  sendMessages(e,["It's a lie\n\n	Ỏ̷͖͈̞̩͎̻̫̫̜͉̠̫͕̭̭̫̫̹̗̹͈̼̠̖͍͚̥͈̮̼͕̠̤̯̻̥̬̗̼̳̤̳̬̪̹͚̞̼̠͕̼̠̦͚̫͔̯̹͉͉̘͎͕̼̣̝͙̱̟̹̩̟̳̦̭͉̮̖̭̣̣̞̙̗̜̺̭̻̥͚͙̝̦̲̱͉͖͉̰̦͎̫̣̼͎͍̠̮͓̹̹͉̤̰̗̙͕͇͔̱͕̭͈̳̗̭͔̘̖̺̮̜̠͖̘͓̳͕̟̠̱̫̤͓͔̘̰̲͙͍͇̙͎̣̼̗̖͙̯͉̠̟͈͍͕̪͓̝̩̦̖̹̼̠̘̮͚̟͉̺̜͍͓̯̳̱̻͕̣̳͉̻̭̭̱͍̪̩̭̺͕̺̼̥̪͖̦̟͎̻̰_Ỏ̷͖͈̞̩͎̻̫̫̜͉̠̫͕̭̭̫̫̹̗̹͈̼̠̖͍͚̥͈̮̼͕̠̤̯̻̥̬̗̼̳̤̳̬̪̹͚̞̼̠͕̼̠̦͚̫͔̯̹͉͉̘͎͕̼̣̝͙̱̟̹̩̟̳̦̭͉̮̖̭̣̣̞̙̗̜̺̭̻̥͚͙̝̦̲̱͉͖͉̰̦͎̫̣̼͎͍̠̮͓̹̹͉̤̰̗̙͕͇͔̱͕̭͈̳̗̭͔̘̖̺̮̜̠͖̘͓̳͕̟̠̱̫̤͓͔̘̰̲͙͍͇̙͎̣̼̗̖͙̯͉̠̟͈͍͕̪͓̝̩̦̖̹̼̠̘̮͚̟͉̺̜͍͓̯̳̱̻͕̣̳͉̻̭̭̱͍̪̩̭̺͕̺̼̥̪͖̦̟͎̻̰"]);
	  }  
  },
  generate: {
  lastTime: 0,
  cooldown: 500,
  description:"generate <length> <characers> - Generate a random string using selected characters",
	  permission: {
		  onlyMonitored: true
	  },
	  action: function(args, e){
		if(args.length >= 2){
			if(args[0] == parseInt(args[0])){
				if(parseInt(args[0]) > 0 && parseInt(args[0]) <= 1998){
					var text = "";
					
					var possible = "";
					for(i=1; i<args.length;i++)
						possible +=args[i] + " ";
					
					possible=possible.substring(0,possible.length-1);

					for( var i=0; i < parseInt(args[0]); i++ )
						text += possible.charAt(Math.floor(Math.random() * possible.length));

					sendMessages(e, ["`" + text + "`"]);
				}else{
					sendMessages(e,["Second parameter should be higher than 0 and cannot be higher than 1998"]);
				}
				
			}else{
				sendMessages(e,["First parameter should be an integer"]);
			}

		  }
	  }
  },
  channels: {
	  description: "channels - Shows all channels the bot is connected to",
	permission: {
	  group: ["root", "dev"],
      onlyMonitored: true
    },
    action: function(args, e) {
      sendMessages(e, ["**I am currently listening to these channels:**\n```" + database.channels + "```"]);
    }
  },
  
  version: {
	description: "version - Shows the current version of the bot",
	permission: {
      onlyMonitored: true
    },
    action: function(args, e) {
      sendMessages(e, ["My current version is: **" + VERSION + "**\n"]);
    }
  },
  info: {
	description: "info - Shows information about the bot",
    permission: {
      onlyMonitored: true
    },
    action: function(args, e) {
      var t = Math.floor((((new Date()).getTime() / 1000) - startTime));
      sendMessages(e, [
	  "My current version is: `" + VERSION + "`\n" + 
	  "I been awake since `" + tm(startTime) + "`\n" + 
	  "I am in `" + MODE + "` mode right now.\n" + 
	  "My current uptime is: `" + t + "` seconds\n" + 
	  "The global cooldown is set to `" + config.globalcooldown/1000 +"` seconds\n" + 
	  "<@132842210231189504> is my owner!\n\nI stole the core from Zephy, who in turn stole it from Windsdon"]);
    }
  }, 
	uptime: {
	description: "uptime - Shows the current uptime of the bot",
	permission: {
      onlyMonitored: true
    },
    action: function(args, e) {
      var t = Math.floor((((new Date()).getTime() / 1000) - startTime));
      sendMessages(e, ["My current uptime is: `" + t + "` seconds"]);
    }		
	},
	database: require("./modules/module_database.js")
}
bot.on('message', processMessage);
bot.on("presence", function(user, userID, status, rawEvent) {
  /*console.log(user + " is now: " + status);*/
});
bot.on("debug", function(rawEvent) {
  /*console.log(rawEvent)*/ //Logs every event
});
bot.on("disconnected", function() {
  console.log("Bot disconnected");
  bot.connect(); //Auto reconnect
});
/*Function declaration area*/
function sendMessages(e, messageArr, interval) {
  var callback, resArr = [],
    len = messageArr.length;
  typeof(arguments[2]) === 'function' ? callback = arguments[2]: callback = arguments[3];
  if (typeof(interval) !== 'number') interval = 1000;
  function _sendMessages() {
    setTimeout(function() {
      if (messageArr[0]) {
        e.bot.sendMessage({
          to: e.channelID,
          message: messageArr.shift()
        }, function(res) {
          resArr.push(res);
          if (resArr.length === len)
            if (typeof(callback) === 'function') callback(resArr);
        });
        _sendMessages();
      }
    }, interval);
  }
  _sendMessages();
}
function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb); // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
function processMessage(user, userID, channelID, message, rawEvent) {
  console.log("-----------");
  console.log("Got message: '" + message/*.replace(/[^A-Za-z0-9 ]/, '?')*/ + "' on channel '" + bot.fixMessage("<#" + channelID + ">") + "' (" + channelID.replace(/[^A-Za-z0-9 ]/, '?') + ") from '" + user + "' (" + userID.replace(/[^A-Za-z0-9 ]/, '?') + ")");
  if (userID == bot.id) {
    return;
  }
  var parsed = parse(message);
  if (!parsed) {
    //console.log("Not a command");
    return;
  }
//console.log(message.substring(config.listenTo.length + 3).substring(message.indexOf(" ")));
  if (parsed.command == "eval") {
    if (userID != config.masterID) {
      bot.sendMessage({
        to: channelID,
        message: "<@" + userID + "> Only <@" + config.masterID + "> can use that command!"
      });
      return;
    }
    try {
      bot.sendMessage({
        to: channelID,
        message: "```" + eval(parsed.args.join(" ")) + "```"
      });
    } catch (e) {
      bot.sendMessage({
        to: channelID,
        message: "Something went wrong! \n\n```" + e.message + "```"
      });
    }
    return;
  }
  if (canUserRun(parsed.command, userID, channelID) != 0) {
	  switch(canUserRun(parsed.command, userID, channelID)){
		  case -1:
		  bot.sendMessage({
			to: channelID,
			message: "An unknown error occured."			
		});
		  break;
		  
		  case 1:
		  console.log("User cant run this command");
		  break;
		  
		  case 2:
		  bot.sendMessage({
			to: channelID,
			message: "You do not have the required permissions to run this command."			
		});
		  break;
		  case 3:
		  bot.sendMessage({
			to: channelID,
			message: "I do not know that command."			
		});
		  break;
		  
	  }

    return;
  }
  if (commands[parsed.command]) {
    if (commands[parsed.command].cooldown) {
      if ((new Date()).getTime() - commands[parsed.command].lastTime < commands[parsed.command].cooldown) {
        bot.sendMessage({
          to: channelID,
          message: "<@" + userID + "> you are doing that too fast!"
        });
        bot.deleteMessage({
          channel: channelID,
          messageID: rawEvent.d.id
        });
        return;
      }
    }
    commands[parsed.command].action(parsed.args, {
      "user": user,
      "userID": userID,
      "channelID": channelID,
      "rawEvent": rawEvent,
      "bot": bot,
      "db": database,
	  "config": config
    });
    commands[parsed.command].lastTime = (new Date()).getTime();
  }
}
function parse(string) {
  /*if (string.charAt(0) != '~') {
    return false;
  }*/
  var pieces = string.split(" ");
  if (pieces[0].toLowerCase() != config.listenTo) {
    return false
  }
  if (pieces[1] === undefined) return null;
  if (pieces[1] === "\u2764") pieces[1] = "love"; //ech, used for love command because the receives a heart shaped character
  /*pieces[0] = pieces[0].slice(config.username.length, pieces[0].length);*/
  //console.log(pieces.slice(1, pieces.length));
  return {
    command: pieces[1].toLowerCase(),
    args: pieces.slice(2, pieces.length)
  };
}
function canUserRun(command, uid, channelID) {
	
	/*
	0 = Can Run
	1 = Not listening
	2 = No permission
	3 = Invalid command
	
	-1 = No, other error
	
	*/
	
  if (!commands[command]) {
    if (database.channels.indexOf(channelID) == -1) {
		if(bot.serverFromChannel(channelID) != undefined){
		  console.log("User can't run the previous command because I am not listening in this channel.");
		  return 1;
		}
    }
    if (database.messages[command]) {
      return 1;
    }
    /*if (database.images[command]) {
      return true;
    }*/
    console.log("User can't run the previous command because I don't know it");
    return 3;
  }
  if (!commands[command].permission) {
    if (database.channels.indexOf(channelID) != -1) {
      return 1;
    } else {
      return 2;
    }
  }
  if (commands[command].permission.onlyMonitored) {
    if (database.channels.indexOf(channelID) == -1) {
		if(bot.serverFromChannel(channelID) != undefined){
		  console.log("User can't run the previous command because I am not listening in this channel.");
		  return 1;
		}
    }
  }
  if (!commands[command].permission.uid && !commands[command].permission.group) {
    return 0;
  }
  if (commands[command].permission.uid) {
    for (var i = 0; i < commands[command].permission.uid.length; i++) {
      if (uid == commands[command].permission.uid[i]) {
        return 0;
      }
    }
  }
  if (commands[command].permission.group) {
    for (var i = 0; i < commands[command].permission.group.length; i++) {
      if (database.isUserInGroup(uid, commands[command].permission.group[i])) {
        return 0;
      }
    }
  }
  return 2;
}
function tm(unix_tm) {
  var dt = new Date(unix_tm * 1000);
  return /*dt.getHours() + '/' + dt.getMinutes() + '/' + dt.getSeconds() + ' -- ' + */dt;
}
