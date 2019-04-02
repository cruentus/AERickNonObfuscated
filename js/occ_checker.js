/**
Version: 0.1a
Author: Rick
For Astro Empires game
Usage: Tick the checkbox for it to cycle through all your occs and it will alert you if there is any enemy fleet present.
Alerts via discord but it's pretty fucky right now since webhooks go off of actual ID and not userID.
Will probably edit the userinput box to just be the actual ID and teach people how to grab their ID.
**/


// Declare global vars here
var canRun = true; // for admin checking
var _page = getPageType();
var occDiv = document.getElementById("base_div"); // Grab the floating window on the right
var href = window.location.href; // Get window location
var domain = href.substring(0, href.search('com') + 4); // Pull the server name
var thisServer = getServer();
(function() {
	//Anti-Detection
	//http://cdn.astroempires.com/javascript/js_jquery_debug_v1.0.js
	var all_js = document.getElementsByTagName('script');
	for (var i = 0; i < all_js.length; i++) {
		var src = all_js[i].getAttributeNode("src");
		if (src == null) continue;
		var value = src.value;
		//Log(value);
		if (value.search("js_jquery_debug") > 0) {
			alert("Disabled, admins were looking.");
			canRun = false;
			return;
		}
	}
});


// Simple replacement of getelementbyid with $$ to save typing
function $$(variable) {
	if (!variable) return;
	//  //console.log("$$("+variable+")");
	var node = document.getElementById(variable);
	if (node) return node;
}

// Function to grab all occs from your economy page. Uses xpath to grab the table containing occs
// then loops through and stores all locations in an array to use later for checking for enemy fleet.
// This can only be run when on the Economy Page.
function getOccs() {
	var occArray = [];
	var occList = document.evaluate(
		"//table[@id='empire_economy_occupied']/tbody/tr[2]/td/form/table/tbody/tr", // Getting occs with Xpath
		document,
		null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
		null);
	var occLength = occList.snapshotLength; // store number of occs here
	if (occLength === 0) return;
	for (i = 0; i < occLength; i++) { // Loop through all occs
		let occLoc = occList.snapshotItem(i).childNodes[1].textContent; // Pull the location and store it in a variable
		occArray.push(occLoc); // Push that variable into an array
		//console.log("Occ " + (i + 1) + ": " + occArray[i]);
	}
	localStorage.removeItem("occs" + accID); //To remove old ones, replace with these
	localStorage.setItem("occs" + accID, occArray.length == 0 ? '' : occArray.join(',')); // Store all of the array into a local storage, separated by a comma
	//console.log(occArray);
	Materialize.toast('Parsed new occ list!', 4000)
}

if (canRun) {
	if (_page == 'profile') {
		getGuild()
	}
	var search = decodeURIComponent(window.location.search).replace('?', '');
	switch (window.location.pathname.replace('/', '').replace('.aspx', '')) { // Check page location...
		case 'empire': // If ends in empire
			if (search == '' || search.match(/view=economy/) != null) { // Check if it's economy page...
				getOccs(); // If true, call the occ parsing function
			}
			break;
	}
	// Create container to store the reports
	var occReport = document.createElement('p');
	var occReports = occDiv.getElementsByClassName("myreport");
	occReport.setAttribute("class", "myreport");
	var occTimer; // Not used yet
}

function stripPlayerID(str) {
	var newstr = String(str);
	var re = /([0-9])\w+/;
	var result = newstr.match(re);
	//console.log(result[0]);
	var strResult = String(result[0])
	return strResult;
}

// to get our guild tag
function getGuild() {
	var guild;
	var c = document.evaluate(
		"//table[contains(@id,'profile')]",
		document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (isNewStyle())
		c = c.firstChild.firstChild.textContent;
	else
		c = c.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.textContent;
	//console.log(c);
	var d = c.indexOf(' ', 0); // check for space to show guild tag split
	if (d == -1) guild = '';
	else guild = trim(c.substring(0, d));
	var name = c.substring(d + 1, c.length); // split string into guild/tag
	Materialize.toast('Setting players guild: ' + guild, 4000)
	console.log(guild);
	console.log(name);
	save('name' + accID, name);
	save('guild' + accID, guild);
}

function checkOccs(loc, counter, totalOccs) {
	var occProg = document.getElementById('occ_prog');
	var mygTag = load('guild' + accID);
	var myName = load('name' + accID);
	console.log('mygTag: ' + mygTag);
	$.get("/map.aspx?loc=" + loc, function(data, status) { // Get the page
		var resp = parseToDOM(data) // Parse that data
		var respFleets = $(resp).find("#map_fleets > tbody > tr:nth-child(2) > td > table > tbody") // Check for fleet table
		var flagAlert = false;
		var minFleet = document.getElementById('fleet_input').value;
		console.log(respFleets);
		let len = respFleets[0].childNodes.length // Check amount of fleets present, store it in a variable
		if (len === 0) return;
		var incfleetArray = [];
		for (i = 0; i < len; i++) { // for each fleet present...
			var pid = stripPlayerID(respFleets[0].childNodes[i].childNodes[1].firstElementChild.href); // Parse player ID
			var ttLCont = respFleets[0].childNodes[i].childNodes[2].id;
			var timetoLand = ""
			if (ttLCont != "") timetoLand = respFleets[0].childNodes[i].childNodes[2].title; // parse time til fleet lands
			var fleetSize = stripCommas(respFleets[0].childNodes[i].childNodes[3].innerText); // Parse fleet size
			var gTag = getGuildTag(respFleets[0].childNodes[i].childNodes[1].innerText); // Parse guild tag
			var pName = getPlayerName(respFleets[0].childNodes[i].childNodes[1].innerText); // Parse player name
			var checkGuild = true;
			if (mygTag == null) {
				Materialize.toast('Visit your profile page to set your guild.', 4000)
				return
			}
			if (mygTag == '') {
				console.log('We have no guild tag, not checking guilds');
				checkGuild = false;
			}
			if (pid != accID) { // If player ID doesnt match ours
				if (checkGuild) {
					if (timetoLand == "-" || timetoLand == "DONE" || timetoLand == "" || timetoLand == -1) {
						timetoLand = " LANDED "
					} else {
						timetoLand = new Date(timetoLand * 1000).toISOString().substr(11, 8);
					}
					if (gTag != mygTag && fleetSize > minFleet) {
						incfleetArray.push(fleetSize, gTag, pName, timetoLand);
						flagAlert = true;
					}
				} else if (fleetSize > minFleet) flagAlert = true;
			}
		}
		//respFleets[0].childNodes[i].childNodes[3].innerText = fleet size
		//respFleets[0].childNodes[i].childNodes[1].firstElementChild.href = "https://mystic.astroempires.com/profile.aspx?player=1925"
		//respFleets[0].childNodes[i].childNodes[1].innerText = "[Meat] Ætheric"
		// /\[(.*?)\]/g returns [Meat] from above string
		// easy way to pull guild ids and compare for alert filterings
		let enable_enemies = document.getElementById('enemy_chkbox').checked;
		if (!flagAlert) {
			if (!enable_enemies) occReport.innerHTML += '<br>(' + counter + '/' + totalOccs + ') OK';
			occProg.value = '(' + counter + '/' + totalOccs + ') OK';
			return;
		} else {
			occReport.innerHTML += "<br>(" + counter + "/" + totalOccs + ") <a href=" + domain + "map.aspx?loc=" + loc + ">" + loc + "</a>";
			var totalFleetInc = 0;
			var discordMsgData = "\n List of fleets ```";
			for (var i = 0; i < incfleetArray.length; i += 4) {
				occReport.innerHTML += "<br>" + incfleetArray[i] + " Fleet " + incfleetArray[i + 1] + " " + incfleetArray[i + 2];
				discordMsgData += "\n \n" + incfleetArray[i + 1] + incfleetArray[i + 2] + " Size: " + incfleetArray[i] + " Landing in: " + incfleetArray[i + 3];
				totalFleetInc += parseInt(incfleetArray[i]);
			}
			discordMsgData += "```";
			discordMsgData += "``` Total Fleet: " + totalFleetInc + "```";
			occReport.innerHTML += "<br>Total Fleet: " + totalFleetInc;
			let enable_alert = document.getElementById('occ_alert').checked;
			let discID = load('discord_id')
			var parsedID;
			var url;
			//https://discordapp.com/api/webhooks/560626777395953664/RExZ5Yu24GALGPIGv6J7LfAS469ifGs2MbJRco_NCb-x279Rni10SsLIFiOCxDKBBtkQ <-- Rick Bot
			//https://discordapp.com/api/webhooks/560655733385986049/YQ1sbzOeB-5ERflsgvociMA1Pryztn3-37biQ8T9lxmUCvmINpYb5nq8LeH_w9VhZ4gR <-- Lucian Bot
			//https://discordapp.com/api/webhooks/560656080741335057/1jHhOSTaz08ZJtG54RjHk-YZPMtcSofffY0PB1acYZX_cTrIz8bWcna48-a2FaguAcc0 <-- Vorlon Bot
			if (enable_alert) {
				switch (discID) {
					case 'Rick#6785':
						url = 'https://discordapp.com/api/webhooks/560626777395953664/RExZ5Yu24GALGPIGv6J7LfAS469ifGs2MbJRco_NCb-x279Rni10SsLIFiOCxDKBBtkQ';
						parsedID = '450810677540683787';
						break;
					case 'Tothlar#0453':
						url = 'https://discordapp.com/api/webhooks/560655733385986049/YQ1sbzOeB-5ERflsgvociMA1Pryztn3-37biQ8T9lxmUCvmINpYb5nq8LeH_w9VhZ4gR';
						parsedID = '269134304896876554';
						break;
					case 'Vorlon/DeJa#2736':
						url = 'https://discordapp.com/api/webhooks/560656080741335057/1jHhOSTaz08ZJtG54RjHk-YZPMtcSofffY0PB1acYZX_cTrIz8bWcna48-a2FaguAcc0';
						parsedID = '92570607526379520';
						break;
					default:
						url = 'https://discordapp.com/api/webhooks/560626777395953664/RExZ5Yu24GALGPIGv6J7LfAS469ifGs2MbJRco_NCb-x279Rni10SsLIFiOCxDKBBtkQ';
						parsedID = false;
				}
				if (parsedID) {
					sendDiscord(url, myName, loc, discordMsgData, parsedID);
				} else {
					sendDiscord(url, myName, loc, discordMsgData);
				}

			}
			return;
		}
	})
	if (!occReports || occReports.length <= 0) {
		occDiv.appendChild(occReport);
	} else {
		occDiv.insertBefore(occReport, occReports[0]);
	}
}

function occsPrep() {
	var occProg = document.getElementById('occ_prog');
	let enabled = document.getElementById('occ-checker').checked;
	if (!enabled) {
		clearInterval(occTimer)
		return;
	} else {
		let occCheckArray = []; // Call variable
		occCheckArray = localStorage.getItem("occs" + accID); // Pull data from storage, store into variable array
		occCheckArray = occCheckArray.split(','); // Split the string by commas
		//console.log("occCheckArrayLength: " + occCheckArray.length);
		let nap = 3000 * getRandomFloat(0.9, 1); // Randomize the sleep time
		//console.log("Nap = " + nap);
		for (i = 0; i < occCheckArray.length; i++) { // Loop through each iteration of locations...
			let loc = occCheckArray[i];
			let counter = i + 1 // store counter for progress later
			let totalOccs = occCheckArray.length // store total for progress later
			setTimeout(function() { // Call the checkOccs function for each location...
				checkOccs(loc, counter, totalOccs);
			}, nap * i) // Sleep value is nap multiplied by which iteration
		}
	}
}

// not used yet, but will add in for a timer for some better progress checking
function checkOccTimer() {
	var left = Math.floor((wendtime - getTime()) / 1000);
	if (left <= 0) window.clearInterval(wid);
	updateOccTimer(left);
}

function updateOccTimer(time) {
	var secs = time % 60;
	time = Math.floor((time - secs) / 60);
	var mins = time % 60;
	var hrs = Math.floor((time - mins) / 60);
	if (mins < 10) mins = '0' + mins;
	if (secs < 10) secs = '0' + secs;
	$('#occ_timer').html('');
	$('#occ_timer').append('<label>Time till next cycle: ' + hrs + ':' + mins + ':' + secs + '</label>' + '<lable>  Cycles:' + (occcount + 1) + '</lable>');
}


function check_enabled() {
	var occProg = document.getElementById('occ_prog');
	occCheckArray = localStorage.getItem("occs" + accID);
	if (occCheckArray == '' || occCheckArray == null) {
		Materialize.toast('You must visit economy page to parse your occs', 4000)
		occProg.value = 'Error!';
		return
	}
	let enabled = document.getElementById('occ-checker').checked;
	let sleepBox = document.getElementById('occ_input');
	let sleep = sleepBox.value * 60000 * getRandomFloat(0.9, 1); // Sleep time between cycles
	//console.log("Sleep = " + sleep);
	if (enabled) {
		occProg.value = 'Occ Watcher Started...';
		occsPrep(); // run once	otherwise it waits sleep value before running the first cycle.
		occTimer = setInterval(occsPrep, sleep); // Set it to run continously every [sleep] ms
	} else {
		//console.log('Stopped occChecker');
		clearInterval(occTimer);
		occProg.value = 'Occ Watcher Stopped!';
	}
}

function clearLog() {
	$(".myreport").empty();
}

function toggleOcc() {
	var on_off = document.getElementById('occ_link');
	var ui = document.getElementById('occ_div');
	if (on_off.textContent == '[-]') { // the hint is open, close it
		ui.style.display = 'none';
		on_off.textContent = '[+]';
	} else { // ui is closed, open it
		ui.style.display = '';
		on_off.textContent = '[-]';
	}
}

function insertOccUI() { // Create and insert the UI
	var occ_d = document.createElement('div'); // Container to store everything in
	occ_d.id = 'occ_div';
	occ_d.setAttribute('align', 'left')

	var occ_btn = document.createElement('input'); // The checkbox to turn on / off
	occ_btn.id = 'occ-checker';
	occ_btn.type = 'checkbox';
	occ_btn.checked = false;

	var occ_box = document.createElement('input'); // Sleep value input
	occ_box.id = 'occ_input';
	occ_box.type = 'text';
	occ_box.style.width = '100px';
	occ_box.setAttribute("onkeyup", "localStorage.setItem('occ_sleep', this.value);");
	if (localStorage.getItem('occ_sleep')) {
		occ_box.value = localStorage.getItem('occ_sleep');
	}

	var occ_progress = document.createElement('input'); // Progress tracker
	occ_progress.id = 'occ_prog';
	occ_progress.type = 'text';
	occ_progress.style.width = '150px';
	occ_progress.disabled = true;
	occ_progress.value = 'Occ Watcher Stopped!';

	var occ_alert = document.createElement('input'); // Alert checkbox
	occ_alert.id = 'occ_alert';
	occ_alert.type = 'checkbox';
	occ_alert.checked = false;

	var enemy_chk = document.createElement('input');
	enemy_chk.id = 'enemy_chkbox';
	enemy_chk.type = 'checkbox';
	enemy_chk.checked = false;

	var clear_btn = document.createElement('input');
	clear_btn.id = 'clearBtn';
	clear_btn.type = 'button';
	clear_btn.style.width = '100px';
	clear_btn.value = 'Clear Log';
	clear_btn.addEventListener('click', clearLog, false);

	var link = document.createElement('a');
	link.textContent = '[-]';
	link.id = 'occ_link';
	link.addEventListener('click', toggleOcc, false);
	link.href = 'javascript:void(0);';

	var fleet_box = document.createElement('input'); // Input minimum fleet size
	fleet_box.id = 'fleet_input';
	fleet_box.type = 'text';
	fleet_box.style.width = '100px';
	fleet_box.setAttribute("onkeyup", "localStorage.setItem('occ_fleet', this.value);");
	if (localStorage.getItem('occ_fleet')) {
		fleet_box.value = localStorage.getItem('occ_fleet');
	} else fleet_box.value = "40"

	var discord_box = document.createElement('input');
	discord_box.id = 'discord_input';
	discord_box.type = 'text';
	discord_box.style.width = '100px';
	discord_box.setAttribute("onkeyup", "localStorage.setItem('discord_id', this.value);");
	if (localStorage.getItem('discord_id')) {
		discord_box.value = load('discord_id');
	} else discord_box.value = 'DiscordName#1234';

	// Put it all together
	occDiv.appendChild(document.createElement('br'));
	occDiv.appendChild(link);
	occDiv.appendChild(document.createTextNode(' Occ Checker'))
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(occ_btn);
	occ_d.appendChild(document.createTextNode('Enable'));
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(document.createTextNode('Minimum Fleet:'));
	occ_d.appendChild(fleet_box);
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(document.createTextNode('Sleep (mins): '))
	occ_d.appendChild(occ_box);
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(occ_progress);
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(occ_alert);
	occ_d.appendChild(document.createTextNode('Discord Alert'));
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(document.createTextNode('Discord ID'));
	occ_d.appendChild(discord_box);
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(enemy_chk);
	occ_d.appendChild(document.createTextNode('Show enemies ONLY'));
	occ_d.appendChild(document.createElement('br'));
	occ_d.appendChild(clear_btn);
	occ_d.appendChild(document.createElement('br'));
	occDiv.appendChild(occ_d);
	occ_btn.addEventListener('click', check_enabled, false); // Event listener, when clicked run the check_enabled function
	var uiEnabled = true;
	if (uiEnabled == false) {
		occ_d.style.display = 'none';
		link.textContent = '[+]';
	}
}

//licArray.licenses.mystic[""0""].id
if (canRun == true && authed == 'true') {
	insertOccUI();
}