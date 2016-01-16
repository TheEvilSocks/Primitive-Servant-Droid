var uidFromMention = /<@([0-9]+)>/;
var superAuth = require("../configs/superAuth.json")
var master_osuAPI = require('../node_modules/osu-api');
var osuAPI = new master_osuAPI.Api(superAuth.osu["api_key"]);

module.exports = {
  lastTime: 0,
  cooldown: 5000,
  description: "osu - Dispenses a random osu! beatmap from the list\nosu add <beatmap_id> - Adds an osu! beatmap to the list\nosu list - Lists all beatmaps currently added\nosu count - Counts all osu beatmaps currently in the database",
  permission: {
    onlyMonitored: true,
    group: ["osu","dev", "trusted", "root"]
  },
  action: function(args, e) {
    var osuID = args[1];
    var regex = new RegExp("^[0-9]+$");
    console.log(args[0]);
    if(args[0].toLowerCase() === "add"){
	  var currentTime = new Date().getTime();
      var alreadyExists = false;
      /*if(args[1] == undefined || args[1].length != 11){
        e.bot.sendMessage({
            to: e.channelID,
            message: "<@" + e.userID + "> I can't learn this beatmap, it seems to be invalid."
        });
        return;
      }*/
	  for(var i = 0; i < e.db.beatmaps['id'].length; i++) {
		if(e.db.beatmaps['id'][i] == osuID) {
			alreadyExists = true;
		}
	}
	  
	  	if (regex.test(osuID)) {
			if(!alreadyExists){
			e.bot.sendMessage({
				to: e.channelID,
				//typing: true,
				message: "<@" + e.userID + "> I'm looking up that osu! beatmap ID to be sure it's actually valid, please wait a few seconds!"
			}, function(callback){
				var beatmapTitle = "No :( ";
				  osuAPI.getBeatmapSet(osuID,function(error, output){
					  if(error || !output){
						  e.bot.sendMessage({
							to: e.channelID,
							message: "<@" + e.userID + "> I'm looking up that osu! beatmap ID to be sure it's actually valid, please wait a few seconds!\nI can't learn this beatmap, it seems to be invalid.\n\nError: ```" + error + "```"
						});
					  return;
					  }
					  //console.log(output);
					  if(output[0].title)
						beatmapTitle = output[0].artist + " - " + output[0].title + " ";
					  else
						beatmapTitle = "";
					
					
					if(beatmapTitle != ""){
						e.bot.editMessage({
							channel: e.channelID,
							messageID: callback.id,
							message: "<@" + e.userID + "> I'm looking up that osu! beatmap ID to be sure it's actually valid, please wait a few seconds!\n\nThanks for teaching me this beatmap `" + beatmapTitle + "[" + osuID + "]`\n\nIt took me `" + parseFloat((new Date().getTime() - currentTime)/1000).toFixed(2) + "` seconds." 
						});
					}else{
						e.bot.editMessage({
							channel: e.channelID,
							messageID: callback.id,
							message: "<@" + e.userID + "> It doesn't seem `[" + osuID + "]` is valid :(" 
						});
					}
					  
				
						e.db.beatmaps['id'].push(args[1]);
						e.db.saveConfig();
					  
				  });
				
			});
		  }else{
			e.bot.sendMessage({
				to: e.channelID,
				message: "<@" + e.userID + "> I already know this beatmap `" + osuID + "`"
			});
		  }
		}else{
		  e.bot.sendMessage({
			  to: e.channelID,
			  message: "<@" + e.userID + "> Hah nice try, but I am not stupid. \n(Invalid character in your id)"
		  });
		}
		
		
	  

      

    }else if(args[0].toLowerCase() === "delete"){
      for(var i = 0; i < e.db.beatmaps['id'].length; i++) {
          if(e.db.beatmaps['id'][i] == osuID) {
            console.log(e.db.beatmaps['id'][i]);
              e.db.beatmaps['id'].splice(e.db.beatmaps['id'][i], 1);
              e.bot.sendMessage({
                to: e.channelID,
                message: "<@" + e.userID + "> I forgot that video."
              });
              e.db.saveConfig();
              return;
          }
      }

      e.bot.sendMessage({
        to: e.channelID,
        message: "<@" + e.userID + "> I don't know this video."
      });

      return;
    }else if(args[0].toLowerCase() === "count"){
      e.bot.sendMessage({
          to: e.channelID,
          message: "<@" + e.userID + "> I know **" + e.db.beatmaps['id'].length + "** beatmaps in total"
      });

    }else if(args[0].toLowerCase() === "list"){
      e.bot.sendMessage({
          to: e.channelID,
          message: "<@" + e.userID + "> Listing every beatmap I know [Count: **" + e.db.beatmaps['id'].length + "**]```\n" +e.db.beatmaps['id'] + "```"
      });
    }
    else{
        var osuID = e.db.beatmaps['id'][randomInt(0, e.db.beatmaps['id'].length)];
        e.bot.sendMessage({
            to: e.channelID,
            message: "<@" + e.userID + ">  I found the perfect beatmap for you in my database https://osu.ppy.sh/s/" + osuID
        });
    }
  }
};

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}