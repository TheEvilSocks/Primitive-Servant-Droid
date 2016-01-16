var uidFromMention = /<@([0-9]+)>/;
var database = new(require("../database.js"))();

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


module.exports = {
  lastTime: 0,
  cooldown: 500,
  description: "database create <name> - Creates a new database with a name\ndatabase push <database> <data> - Pushes data into database\ndatabase read <database> [index]\ndatabase drop <database> [index]",
  permission: {
	group:["root"],
    onlyMonitored: true
  },
  action: function(args, e) {
    if (args[0].toLowerCase() == "create") {
		if(args.length == 2){
			database.other[args[1]] = [];
			database.saveConfig();
			e.bot.sendMessage({
				to: e.channelID,
				message: "Database `" + args[1] + "` successfully created."
			 });
		}else{
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Usage:** \ndatabase create <name>"
			 });
		}

    
    }else if (args[0].toLowerCase() == "push"){
		if(args.length >= 3){
			var pushData=args.splice(2).join(" ");
			/*for(i=2;i<args.length;i++){
				pushData+=args[i] + " ";
			}*/
			if(IsJsonString(pushData)){
				pushData = JSON.parse(pushData);
			}
			//pushData = pushData.substring(0,pushData.length-1);
			if(database.other[args[1]] == undefined){
				database.other[args[1]] = [];
				database.other[args[1]].push(pushData);
				database.saveConfig();
				e.bot.sendMessage({
					to: e.channelID,
					message: "Created new database `" + args[1] + "` and pushed data."
				 });
			}else{
				database.other[args[1]].push(pushData);
				database.saveConfig();
				e.bot.sendMessage({
					to: e.channelID,
					message: "Data successfully pushed to `" + args[1] + "`"
				 });
			 }
		}else{
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Usage:** \ndatabase push <database> <data>"
			 });
		}
	}else if(args[0].toLowerCase() == "read"){
			if(database.other[args[1]] == undefined){
				e.bot.sendMessage({
					to: e.channelID,
					message: "Database `" + args[1] + "` does not exist."
				});
				return;
			}
		if(args.length==2){
			var readData = database.other[args[1]];;
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Data from: `" + args[1] + "`**\n``` " + JSON.stringify(readData, null, '\t').replace(/`/g, '\u200B`') + "```"
			 });
		}else if(args.length == 3){
			if(args[2] == parseInt(args[2])){
			var readData = database.other[args[1]][args[2]];
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Data from: `" + args[1] + "[" + args[2] + "]`**\n``` " + JSON.stringify(readData, null, '\t').replace(/`/g, '\u200B`') + "```"
			 });
			}else{
				e.bot.sendMessage({
					to: e.channelID,
					message: "**Index** must be a valid integer."
				 });
			}
		}else{
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Usage:** \ndatabase read <database> [index]"
			 });
		}
		
	}else if(args[0].toLowerCase() == "drop" || args[0].toLowerCase() == "remove"){
		if(database.other[args[1]] == undefined){
			e.bot.sendMessage({
				to: e.channelID,
				message: "Database `" + args[1] + "` is undefined"
			 });
			 return false;
		}
			
		if(args.length==2){
			delete database.other[args[1]];
			database.saveConfig();
			e.bot.sendMessage({
				to: e.channelID,
				message: "Database `" + args[1] + "` dropped."
			 });
		}else if(args.length == 3){
			if(args[2] == parseInt(args[2])){
			database.other[args[1]].splice(parseInt(args[2]),1);
			database.saveConfig();
			e.bot.sendMessage({
				to: e.channelID,
				message: "Index `" + args[2] + "` from database `" + args[1] +"` dropped."
			 });
			}else{
				e.bot.sendMessage({
					to: e.channelID,
					message: "**Index** must be a valid integer."
				 });
			}
		}else{
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Usage:** \ndatabase drop <database> [index]"
			 });
		}
		
		
		//psd eval var arr = ["a","b","c","d"]; arr.splice(1,1); arr;
	}
  }
}