const Parse = require("../util/parse.js");
const DataManager = require("../util/datamanager.js");
const request = require("request");
const rp = require("request-promise");
const config = require("../config.json");
const Embed = require("../util/embed.js");

class Embeds extends Parse {
  constructor(message) {
    super(message)
  }

  async find (args) {
    try {
      let file = await this.getEmbeds();
      for (let [type, collection] of Object.entries(file)) {
        for (let [key, embed] of Object.entries(collection)) {
          if (args[0] !== key) continue;
          let guide = Array.isArray(embed) ? embed : [embed];
          if (this.command === "...") this.message.delete();
          return this.Paginator.sender(guide, this.command === "..." ? Infinity : 180000, type + "." + key); 
        }
      };
      let filter = m => m.author.bot;
      try {
        await this.channel.awaitMessages(filter, {
          "max": 1,
          "time": 1000,
          "errors": ["time"]
        })
      } catch (e) {
        throw "Couldn't find guide matching that name.";
      };
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  async list () {
    try {
      let prefix = this.server.prefixes.nadeko + "..";
      let file = await this.getEmbeds();
      let embed = { //define embed first
        "title": "Guides for server " + this.guild.name + " on " + this.client.user.username,
        "color": 11126483,
        "fields": [],
        "footer": Embed.footer(`Type "${prefix} GuideName" to view a guide. e.g. "${prefix} zh"`)
      };
      for (let [name, collection] of Object.entries(file)) { //for each subsection
        let value = "```css\n"; //to get coloured text
        let embeds = Object.keys(collection);
        for (let i = 0; i < embeds.length; i++) { //for the name of each command
          if (!collection.hasOwnProperty(embeds[i])) continue;
          let line = prefix + " " + embeds[i];
          value += line; //necessary so that we can count line length
          value += (i < embeds.length - 1 && !(i & 1) ? " ".repeat(Math.max(0, 28 - line.length)) + "\u200b" : ""); //spacer
          value += (i & 1 ? "\n" : "");
        };
        value += "```";
        embed.fields = Embed.fielder(embed.fields, name.toProperCase(), value, true);
      };
      this.Output.sender(embed);
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  async getEmbeds () {
    if (this._embeds) return this._embeds;
    try {
      //if (this.client.user.id === config.ids.betabot) throw "";
      let body = await rp(config.urls.embeds);
      this._embeds = JSON.parse(body);
    } catch (e) {
      if (e) this.Output.onError(e);
      this._embeds = DataManager.getFile("./src/data/embeds.json");
    };
    return this._embeds;
  }

}

module.exports = Embeds;

String.prototype.toProperCase = function () {
  let words = this.split(/ +/g);
  let newArray = [];
  for (let i = 0; i < words.length; i++) {
    newArray[i] = words[i][0].toUpperCase() + words[i].slice(1, words[i].length).toLowerCase();
  };
  return newArray.join(" ");
}