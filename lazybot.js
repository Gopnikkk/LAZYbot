const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");

//console startup section

client.on("ready", () => {
  console.log("bleep bloop! It's showtime.");
});

const nadekoprefix = config.nadekoprefix;
const prefix = config.prefix;

//reddit links section

client.on("message", (message) => {

  if (!(message.content.startsWith("/r/") || message.content.startsWith("r/")) || message.author.bot) return;

  if(message.content.startsWith("/r/")) {
    message.channel.send({embed: {
      color: 53380,
      description: `[**${message.content}**](http://www.reddit.com${message.content})`
    }});
  } else

  if(message.content.startsWith("r/")) {
    message.channel.send({embed: {
      color: 53380,
      description: `[**/${message.content}**](http://www.reddit.com/${message.content})`
    }});
  }
  
});

//section for commands that integrate with Nadeko

client.on("message", (message) => {

  if (!message.content.startsWith(config.nadekoprefix) || message.author.bot) return;

  const args = message.content.slice(config.nadekoprefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "nadekoprefix") {

    if(message.author.id !== config.ownerID) return;

    let [newNadekoPrefix] = args;  
    config.nadekoprefix = newNadekoPrefix
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);

    message.channel.send(`Nadeko-Integration Prefix has been updated to **${newNadekoPrefix}** !`);
    console.log(`${message.author.username} [${message.author.id}] has updated NadekoPrefix to ${newNadekoPrefix}`);
  } else

  if (command === "mf") {

  let [games,time,increment] = args
  message.channel.send({embed: {
    title: "House Match Reward",
    color: 53380,
    description: Math.floor(7/12 * parseInt(games) * (parseInt(time) + 2/3 * parseInt(increment))) + " :cherry_blossom:"
  }});

  } else

  if (command === "tf") {

  let [games,time,increment] = args
  message.channel.send({embed: {
    title: "House Tournament Reward",
    color: 53380,
    description: Math.floor(1/10 * parseInt(games) * (parseInt(time) + 2/3 * parseInt(increment))) + " :cherry_blossom:"
  }});

  }

});

client.on("message", (message) => {

  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "prefix" || command === "lazybotprefix") {

    if(message.author.id !== config.ownerID) return;

    let [newPrefix] = args;
    config.prefix = newPrefix
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);

    message.channel.send(`Prefix has been updated to **${newPrefix}** !`);
    console.log(`${message.author.username} [${message.author.id}] has updated the prefix to ${newPrefix}`);
  } else

  if(command === "asl") {
    let [age,sex,location] = args;
    message.channel.send(`Hello **${message.author.username}**, I see you're a **${age}** year old **${sex}** from **${location}**.`);
  } else

  if(command === "blah") {
    message.channel.send("Meh.");
  } else

  if(command === "ping") {
    message.channel.send("pong!");
  } else

  if(command === "marco") {
    message.channel.send("polo!");
  } else

  if(command === "ready") {
    message.channel.send("I am ready!");
  } else

  if(command === "owner") {
    message.channel.send("theLAZYmd#2353");
  } else

  if(command === "help") {
    message.channel.send("This is a pretty basic bot, there isn't much it can help you with.");
  } else

  if(command === "who") {
    message.channel.send("I am LAZYbot#2309");
  }

});

client.login(config.token);
