/**
Utility file for sending messages to our discord channel...
**/

var username = "Occ Bot";

function sendDiscord(url, player, loc, totalMsg, parsedID) {
	//console.log('sending discord, content: ' + content);
	if (parsedID) {
		$.post(url, {
			"content": "Enemies Detected for Player " + player + "'s Occ \n" + domain + "map.aspx?loc=" + loc + " " + totalMsg + "\n <@" + parsedID + ">",
			"username": username
		}, function() {
			Materialize.toast('Message Sent!', 4000)
		});
	} else {
		$.post(url, {
			"content": "Enemies Detected for Player " + player + "'s Occ \n" + domain + "map.aspx?loc=" + loc + " " + totalMsg,
			"username": username
		}, function() {
			Materialize.toast('Message Sent!', 4000)
		});
	}
}