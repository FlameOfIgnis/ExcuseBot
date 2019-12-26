
const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require('fs');


//when the bot is connected and logged in
client.on("ready", () => {
	console.log("Logged in.")
	client.user.setStatus('available')
});


//On invite to a server
client.on("guildCreate", guild => {
});

 
//on removal from a server
client.on("guildDelete", guild => {
});


//when a message is sent
client.on("message", async message => {

});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.login(config.token);
