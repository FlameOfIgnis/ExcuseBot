const Discord = require("discord.js");
const fs = require("fs");

const _insults = require("./insults.json")

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = function(client,_storage){

    function getChannelStorage(guild){
        return _storage + guild.id + ".json";
    }

    function updateConfigs(guild, keyname, newValue){
        var conf = JSON.parse(fs.readFileSync(getChannelStorage(guild)))
        conf[keyname] = newValue;
        fs.writeFileSync(getChannelStorage(guild), JSON.stringify(conf));
    }

    function getConfig(guild){
        return JSON.parse(fs.readFileSync(getChannelStorage(guild)));
    }

    function msgParse(message){
        return message.content.split(" ");
    }

    function insult(){
        var adj = _insults.adjectives[getRandomInt(0,_insults.adjectives.length-1)]
        var noun = _insults.nouns[getRandomInt(0,_insults.nouns.length-1)]
        return  adj + " " + noun;
    }

    function constructCTFEmbed(ctf){
        const embed = new Discord.RichEmbed()
        .setColor('#fc1303')
        .setTitle(ctf.title)
        .setURL(ctf.ctftime_url)
        .setAuthor("by " + ctf.organizers[0].name, ctf.logo, 'https://discord.js.org')
        .setDescription(ctf.description)
        .setThumbnail(ctf.logo)
        .addField(ctf.format, "weight: " + ctf.weight)
        .addBlankField()
        .addField('Start', ctf.start, true)
        .addField('Finish', ctf.finish, true)
        .addField('Duration', (ctf.duration.days)?ctf.duration.days+" and " + ctf.duration.hours + " hours." : ctf.duration.hours + " hours.", true)
        .setImage(ctf.logo)
        .setTimestamp()
        .setFooter('React with 4house to join', ctf.logo);
        return embed;
    }

    function announceNewCTF(guild, ctf){
        var msg = "Hey there " + insult() + ". There is a new ctf coming up!";
        var conf = getConfig(guild);
        client.channels.get(conf["announcementChannel"]).send(msg);
        client.channels.get(conf["announcementChannel"]).send(constructCTFEmbed(ctf));
        return;
    }

    return {
        all:{
            "ping": async function(message){
                const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
                },
                "test": async function(message){
                    var ctf={
                        "organizers": [
                        {
                        "id": 10498,
                        "name": "th3jackers"
                        }
                        ],
                        "onsite": false,
                        "finish": "2015-01-24T08:00:00+00:00",
                        "description": "Registration will be open when CTF Start\r\n#WCTF #th3jackers\r\nhttp://ctf.th3jackers.com/",
                        "weight": 5,
                        "title": "WCTF  - th3jackers",
                        "url": "http://ctf.th3jackers.com/",
                        "is_votable_now": false,
                        "restrictions": "Open",
                        "format": "Jeopardy",
                        "start": "2015-01-23T20:00:00+00:00",
                        "participants": 18,
                        "ctftime_url": "https://ctftime.org/event/190/",
                        "location": "",
                        "live_feed": "",
                        "public_votable": false,
                        "duration": {
                        "hours": 12,
                        "days": 0
                        },
                        "logo": "https://ctftime.org/media/cache/53/3d/533d60a279929f1901999ef938f2c600.png",
                        "format_id": 1,
                        "id": 190,
                        "ctf_id": 93
                        }
                    announceNewCTF(message.guild, ctf)
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
                lst[2] = lst[2].replace(/<|>|#/g, '');
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

