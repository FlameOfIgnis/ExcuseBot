const Discord = require("discord.js");
const fs = require("fs");

module.exports = function(client,_storage){

    function getChannelStorage(guild){
        return _storage + guild.id + ".json";
    }

    function updateConfigs(guild, keyname, newValue){
        var conf = JSON.parse(fs.readFileSync(getChannelStorage(guild)))
        conf[keyname] = newValue;
        fs.writeFileSync(getChannelStorage(guild), JSON.stringify(conf));
    }

    function msgParse(message){
        return message.content.split(" ")
    }

    return {
        all:{
            "ping": async function(message){
                const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
                },
                "test": async function(message){
                    const m = message.channel.send('testing')
                },
                "help": async function(message){
                    message.channel.send('\
						\`\`\`markdown\n\
						# $ping:\n\
						    Shows you how bad my connection is\n\
						# $test:\n\
						    test\n\
						# $help: \n\
                            helps\n\
                        # $setchannel: \n\
                            setchannel [channeltype] [channeltag]\n\
						\`\`\`\
					'.replace(/\t| {4}/g,''))//remove tabs
                }



        },
        admin:{
            "setchannel": async function(message){
                lst = msgParse(message);
                if(lst.length!=3){
                    message.channel.send("Thats not how you use that command.")
                    return;
                }
                var bCorrectFlag=true
                switch(lst[1]){
                    case "announcement":
                        updateConfigs(message.guild,"announcementChannel", lst[2]) 
                    break;
                    case "info":
                        updateConfigs(message.guild,"infoChannel", lst[2]) 
                    break;
                    default:
                        bCorrectFlag=false;
                }
                if(bCorrectFlag) message.channel.send("Oki.")
                else message.channel.send("First modifier is incorrect")
                
            }

        }
    }

}

