var uidFromMention = /<@([0-9]+)>/;
var aniup = require("../node_modules/ani-up");

var hummingbird = aniup.hummingbird;
module.exports = {
  lastTime: 0,
  cooldown: 2000,
  description: "anime info <anime> - Finds information about the anime",//\nanime suggest <watched_anime_you_liked> - Suggest an anime by submitting an anime you already watched",
  permission: {
	//group: ["root"],
    onlyMonitored: true
  },
  action: function(args, e) {
	if(args.length < 2){
		e.bot.sendMessage({
			to: e.channelID,
			message: "**Usage:**\n``" + module.exports.description + "`"
		  });
		return;
	}
	
	//console.log(anime);
    if (args[0].toLowerCase() == "info") {
		var anime = args.slice(1).join(" ");
		hummingbird.searchTopResult(anime, function(err, result) {
			//console.log(err + "\n--------------\n" + result);
			
			if(err) {
				console.log(err);
			}   
			else {
				//console.log(result);
				if(result) {
					var genreNames = []
					for(genre in result.genres){
						genreNames.push(result.genres[genre].name);
					}
					
					var idkSomeShit = "PG";
					if(result.age_rating)
						idkSomeShit = result.age_rating;
					
					
					var animeTotal = "<@" + e.userID + ">\n__***" + result.title + "***__\n";
					
					
					if(idkSomeShit.toLowerCase() == "r17+"){
						if(e.config.nsfw)
							if(result.url){
							animeTotal+="**URL:** " + result.url + "\n";
						}
					}else{
						if(result.url){
							animeTotal+="**URL:** " + result.url + "\n";
						}
					}
					
					if(result.status){
						 animeTotal+="**Current Status:** " + result.status + "\n"
					}
				
					
					if(result.started_airing){
						if(new Date(result.started_airing).getTime() > new Date().getTime()){
							animeTotal+="**Will Air:** " + result.started_airing + "\n";
						}else{
							animeTotal+="**Started Airing:** " + result.started_airing + "\n";
						}
					}
					
					if(result.finished_airing){
						if(new Date(result.finished_airing).getTime() > new Date().getTime()){
							animeTotal+="**Will Finish Airing:** " + result.finished_airing + "\n";
						}else{
							animeTotal+="**Finished Airing:** " + result.finished_airing + "\n";
						}
					}
					
					if(result.episode_count){
						animeTotal+="**Total Episodes:** " + result.episode_count + "\n";
					}
					
					if(result.community_rating){
						animeTotal+="**Average Rating:** " + parseFloat(result.community_rating).toFixed(2) + "\n"
					}
					
					if(result.age_rating){
						animeTotal+="**Age Rating:** " + result.age_rating + "\n"
						
					}
					
					if(result.genres){
						animeTotal+="**Genres:** " + genreNames.join(", ") +"\n";
					}
					
					if(result.synopsis){
						animeTotal+="**Synopsis:** ```" + result.synopsis + "```\n";
					}
					
					
					
					      e.bot.sendMessage({
							to: e.channelID,
							message: animeTotal
						  });
				}else{
					e.bot.sendMessage({
						to: e.channelID,
						message: "Couldn't find any anime's using your query."
					});
				}
			}   
		}); 

    
    }/*else if(args[0].toLowerCase() == "vote"){
		if(args.length < 3){
			e.bot.sendMessage({
				to: e.channelID,
				message: "**Usage:**\n``" + module.exports.description + "`"
			  });
			return;
		}
		var vote = parseInt(args[1]);
		var anime = args.slice(2).join(" ");
		
		var voteObject = {}
		e.db.
		
	}*/
  }
}