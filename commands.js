const Discord = require("discord.js");
const fs = require("fs");
const request = require("request")
const _insults = require("./insults.json")

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



module.exports = function(client,_storage){
    
    var announcements=  JSON.parse(fs.readFileSync(_storage + "announcements.json"))
    var lastAnnouncedCTF = announcements["lastAnnouncement"]
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

    function saveAnnouncementsState(){
        fs.writeFileSync(_storage + "announcements.json", JSON.stringify(announcements));
    }


    function updateFromCTFTime(limit){
        if(!limit) limit=5;
        request('https://ctftime.org/api/v1/events/?limit=' + limit, function (error, response, body) {
            var ctfs = JSON.parse(body)
            for (var num=0;num<ctfs.length;num++){
                var ctf=ctfs[num]
                if(ctf.id==announcements.lastAnnouncement){
                    console.log("Reached already announced ones.")
                    break;
                }
                client.guilds.forEach(_guild=>{
                    announceNewCTF(_guild,ctf);
                })
            }
            announcements.lastAnnouncement=ctfs[0].id;
            saveAnnouncementsState();
        });
    }
    setInterval(updateFromCTFTime, 600000);


    function constructCTFEmbed(conf, ctf){
        const embed = new Discord.RichEmbed()
        .setColor('#fc1303')
        .setTitle(ctf.title)
        .setURL(ctf.ctftime_url)
        .setAuthor("by " + ctf.organizers[0].name, ctf.logo, 'https://discord.js.org')
        .setDescription(ctf.description)
        .setThumbnail(ctf.logo)
        .addField(ctf.format, "weight: " + ctf.weight)
        .addField("id", ctf.id)
        .addBlankField()
        .addField('Start', ctf.start, true)
        .addField('Finish', ctf.finish, true)
        .addField('Duration', (ctf.duration.days)?ctf.duration.days+" and " + ctf.duration.hours + " hours." : ctf.duration.hours + " hours.", true)
        .setImage(ctf.logo)
        .setTimestamp()
        .setFooter('React with ' + conf["joinEmote"] + ' in 4 hours to join', ctf.logo);
        return embed;
    }

    async function announceNewCTF(guild, ctf){
        var msg = "Hey there " + insult() + ". There is a new ctf coming up!";
        var conf = getConfig(guild);
        client.channels.get(conf["announcementChannel"]).send(msg);
        await client.channels.get(conf["announcementChannel"]).send(constructCTFEmbed(conf, ctf)).then(message=>{
            announcements[ctf.id]={}
            announcements[ctf.id]["ctf"]=ctf
            announcements[ctf.id].message=message.id;
            message.react(conf["joinEmote"])
            guild.createRole({name:ctf.title, color:'PURPLE'}).then(role=>{
                announcements[ctf.id].role=role.id
                guild.createChannel(ctf.title,{
                    type: 'text',
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: ['VIEW_CHANNEL']
                        },
                        {
                            id: role.id,
                            allow: ['VIEW_CHANNEL']
                        },
                        {
                            id: client.user.id,
                            allow: ['VIEW_CHANNEL']
                        }
                    ]
                }).then(channel=>{
                    announcements[ctf.id].channel=channel.id
                    channel.setParent(conf["ctfCategory"]);
                    saveAnnouncementsState();
                })
                
                
            })

            const filter = (reaction, user) => {
                return [conf["joinEmote"]].includes(reaction.emoji.name);
            };

            message.awaitReactions(filter, { max: 1000, time: 14400000, errors: ['time'] }).then(collected=>{
                message.channel.send("How the fuck is this possible?!!")
            }).catch(collected => {
                collected.get(conf["joinEmote"]).users.forEach(user=>{
                    guild.members.get(user.id).addRole(announcements[ctf.id].role);
                })
            });
           
        })
    }

    return {
        all:{
            "ping": async function(message){
                const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
                },
                "test": async function(message){
                    return;
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
                    message.channel.send(`
                    \`\`\`markdown
						# $ping:
						    Shows you how bad my connection is
						# $test:
						    test
						# $help:
                            helps
                        # $setchannel: 
                            setchannel [channeltype] [channeltag]
						\`\`\`\ `.replace(/\t| {4}/g,''))//remove tabs
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
                
            },
            "setjoin": async function(message){
                lst = msgParse(message);
                if(lst.length!=2){
                    message.channel.send("Pass an emote as a paramater, or gtfo.")
                    return;
                }
                updateConfigs(message.guild,"joinEmote", lst[1]) 
            },

            "setctfcategory": async function(message){
                lst = msgParse(message);
                if(lst.length!=2){
                    message.channel.send("Tag a category or gtfo.")
                    return;
                }
                updateConfigs(message.guild,"ctfCategory", lst[1]) 
            },

            "endctf": async function(message){
                lst = msgParse(message);
                if(lst.length!=2){
                    message.channel.send("Pass a ctf id as a paramater, or gtfo.")
                    return;
                }
                try{
                    await message.guild.channels.get(announcements[lst[1]].channel).delete();
                    message.guild.roles.find(role => role.name === announcements[lst[1]].ctf.title).delete();
                }
                catch(err){
                    console.log(err)
                }
            },
            "forceCheck": async function(message){
                lst = msgParse(message);
                if(lst.length!=2){
                    updateFromCTFTime();
                }
                updateFromCTFTime(lst[1]);
            },
            "announce": async function(message){
                lst = msgParse(message);
                if(lst.length!=2){
                    message.channel.send("Pass a ctf id as a paramater, or gtfo.")
                    return;
                }
                try{
                    request('https://ctftime.org/api/v1/events/' + lst[1] + '/', function (error, response, body) {
                        var ctf = JSON.parse(body)
                        announceNewCTF(message.guild,ctf);
                    });
                }
                catch(err){
                    console.log(err)
                }
            }
        }
    }

}

