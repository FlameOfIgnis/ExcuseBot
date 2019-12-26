
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require('fs');

//where our per server configs are stored
const _storage = __dirname + '/storage/'

//status list to shuffle from
var status = require('./status.json').status;

//include commands
var commands = require('./commands.js')(client,_storage);

//////////////////////////////////Events////////////////////////////////////////////

//when the bot is connected and logged in
client.on("ready", () => {
	console.log("Logged in.")
	client.user.setStatus('available')
	startStatusCycle(10000);
});

//On invite to a server
client.on("guildCreate", guild => {
	console.log("New invite to " + guild.id);
	var filename = guild.id + ".json";

	//check/create configs for server
	if(fs.existsSync(_storage + filename)){
		console.log("Old configs found.")
	}else{
		createFreshConfigs(filename);
	}

});
 
//on removal from a server
client.on("guildDelete", guild => {
	console.log("We got kicked from " + guild.id + " pepehands")
});

//when a message is sent
client.on("message", async message => {
	//Don't listen to self
	if(message.author == client.id) return;

	//check message for prefix
	if(message.content.startsWith(config.prefix)){
		//split after space, rest is arguements
		var command = message.content.substr(1).split(' ')[0];
		try{
			//try to get the command executed
			commands.all[command](message);
		}
		//error means thats not a valid command
		catch(err){
		}
		//if user is an administrator allow access to admin level commands
		if(message.member.hasPermission(["ADMINISTRATOR"])){
			try{
				commands.admin[command](message);
			}
			catch(err){}
		}	
	}
});
//////////////////////////////////Helper functions////////////////////////////////////////////

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createFreshConfigs(filename){
	var conf = {
		"announcementChannel": -1,
		"lastAnnouncedEventID": -1
	}
	fs.writeFileSync(_storage + filename, JSON.stringify(conf));
}

function setNewStatus(){
	var newstatus=status[getRandomInt(0,status.length-1)]
	client.user.setPresence({game:newstatus})
}

function startStatusCycle(delayms){
	setInterval(setNewStatus, delayms);
}



//Start the bot
client.login(config.token);