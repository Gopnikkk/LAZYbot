const Parse = require("../../util/parse.js");
const DataManager = require("../../util/datamanager.js");

class Main extends Parse {
  
  constructor(message) {
    super(message);
  }

  get election() {
    if (this._election) return this._election;
    return this.guild ? DataManager.getServer(this.guild.id, "./src/data/votes.json") : null;
  }

  set election(election) {
    this._election = election;
    DataManager.setServer(election, "./src/data/votes.json");
    return election;
  }

  async run() { //router
    try {
      let command = this.args.shift() || "";
      command = command.toLowerCase();
      if (command && command !== "get" && !this.Permissions.role("owner", this)) throw this.Permissions.output("role");
      if (/^(?:status)?$/.test(command)) command = "generate";
      if (/^reset|init$/.test(command)) command = "initiate";
      if (typeof this[command] === "function") this[command](); //looks for, this.register(), this.get(), this.disqualify()
      else throw "Invalid second parameter given **" + command + "**.";
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  static validate(election, user, type = "voters") { //returns an array of channels
    return Object.entries(election.elections) //get rid of the extra properties. if a user object is provided, check if the user is in the voters data
      .filter(([channel, data]) => data[type] && (!user || Object.keys(data[type]).includes(user.id)))
      .map(([channel]) => channel);
  }

}

module.exports = Main;