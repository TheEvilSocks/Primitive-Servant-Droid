var uidFromMention = /<@([0-9]+)>/;
var giphy = require('giphy-api')();
module.exports = {
  lastTime: 0,
  cooldown: 500,
  description: "gif <search term> - Searches for a list of GIFs and chooses a random one out of that list.",
  permission: {
    onlyMonitored: true
  },
  action: function(args, e) {

    if (args.length >= 1) {
		/*var offSet = 0;
		if(args.length == 2){
			offSet = parseInt(args[1]);
		}*/
		
		// Search with options using callback 
		giphy.random({
			q: args[0],
			rating: 'g',
			fmt: "gif"
		}, function(err, res) {

			e.bot.sendMessage({
				to: e.channelID,
				message: res.data.image_url
			});
		});

    
    }
  }
}