const Parse = require("../../util/parse.js");
const DataManager = require("../../util/datamanager.js");
const Embed = require("../../util/embed.js");

class Ballots extends Parse {

  constructor(message) {
    super(message);
    this.election = this.guild ? DataManager.getServer(this.guild.id, "./src/data/votes.json") : "";
  }

  async setData(election) {
    DataManager.setServer(election, "./src/data/votes.json");
  }

  async run(args) {
    try {
      let command = args.shift().toLowerCase();
      if (typeof this[command] === "function") this[command](args); //looks for, this.one(), this.all(), and mobile which is a subset of this.one()
      else throw "Invalid second parameter given **" + command + "**.";
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  async one(args) { //sends one ballot. Purpose is to test the all function
    try {
      let user = this.author, argument = args.join(" ");
      if (argument) {
        if (!await this.Permissions.role("owner", this)) throw await this.Permissions.output("owner", this);
        let _user = this.Search.users.get(argument);
        if (_user) user = _user;
        else throw "Couldn't find user **" + argument + "**."; //identify a user if argument given
      };
      this.send([user], this.message.content.includes("mobile")); //and send an array of length 1 to the all functions
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  async all () {
    try {
      if (this.server.states.election.voting) throw "This command cannot be used once voting has begun!"; //set to true at the end
      let object = {};
      for (let [type, data] of Object.entries(this.election)) { //for each election
        if (type.startsWith("_")) continue;
        for (let id in data.voters)
          if (!object[id]) object[id] = true; //if the id isn't a property of the object, make it so
      };
      let array = Object.keys(object).map(id => this.Search.users.byID(id)); //then take the keys, and turn each id into a user object
      this.server.states.election.voting = true; //so this command cannot be used more than once
      DataManager.setServer(this.server);
      this.send(array);
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  async send(users, mobile) {
    try {
      let voterCount = users.length, ballotCount = 0;
      let msg = await this.Output.sender({
        "description": `Initiating sending ${mobile ? "mobile " : ""}ballots...`,
        "footer": Embed.footer(`Sending 0 / 0 ballots to 0 / ${voterCount} voters.`)
      });
      let voterChannels = users.map(user => [user, Ballots.validate(this.election, user)]); //Actually generate all the channels that need to be sent first!
      for (let [user, channels] of voterChannels) //validate returns an array of channels (as ids) that the user is eligible to vote for
        ballotCount += channels.length; //count them (for the beginning message)
      await this.Output.editor({
        "description": `Initiating sending ${mobile ? "mobile " : ""}ballots...`,
        "footer": Embed.footer(`Sending 0 / ${ballotCount} ballots to 0 / ${voterCount} voters.`)
      }, msg);
      let voterRunning = 0, ballotRunning = 0, string = "";
      for (let i = 0; i < voterChannels.length; i++) {
        let [user, channels] = voterChannels[i]; //for each user
        setTimeout(() => {
          try {
            if (!mobile) {
              let ballot = Ballots.gen(this.election, user, channels);  //generate the full ballot for desktop users
              if (user.id === this.author.id && ballot) this.Output.sender(ballot, user);
            } else {
              let ballots = Ballots.fields(this.election, user, channels);  //otherwise just generate the fields
              for (let j = 0; j < ballots.length; j++) {
                setTimeout(() => {
                  let ballot = ballots[j].value.slice(6, -3).trim();  //and send them individually
                  //user.send(ballot);
                  setTimeout(() => {
                  //this.Output.generic("", user);  //with an empty embed to separate them
                  }, 1000);
                }, 2000 * j);
              };
            };
            this.Output.editor({  //on the aesthetic log message, edit it to 'sending' plus the user plus basic details
              "description": `Sending ${channels.length} ${mobile ? "mobile " : ""}ballots to **${user.tag}**`,
              "footer": Embed.footer(`Sent ${ballotRunning} / ${ballotCount} ballots to ${voterRunning} / ${voterCount} voters.`)
            }, msg);
            console.log(`${user.tag}: [${channels.join(", ")}]`);  //log it. Add to text string
            string += `#${user.tag}: [${channels.join(", ")}]\n`;
            ballotRunning += channels.length; //up the running totals to edit our aesthetic footer message
            voterRunning++;
          } catch (e) {
            if (e) this.Output.onError("**" + user.tag + "**: " + e);
          };
          if (i === voterChannels.length - 1) setTimeout(() => {
            let embed = {
              "description": `Finished sending ${ballotRunning} ballots.`,
              "footer": Embed.footer(`Sent ${ballotRunning} / ${ballotCount} ballots to ${voterRunning} / ${voterCount} voters.`)
            };
            this.Output.editor(embed, msg);
            if (mobile) this.Output.sender(embed, user);
            else this.Output.data(string, this.Search.channels.get(this.server.channels.mod), "css");
            return;
          }, 30000)
        }, 1000 * i * (mobile ? channels.length * 2 : 1))
      };
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  static gen(election, user, channels) {
    try {
      let ballot = {
        "author": {
          "name": "House Discord Server Mod Elections: " + Date.getISOtime(Date.now()).slice(4, 15),
          "icon_url": "https://i.imgur.com/YWF70U4.png",
          "url": election._url || "",
        },
        "title": "This constitutes your voting ballot for this election.",
        "description": "- Please copy and paste the dark boxes below and fill in the checkboxes on the left with numbers, indicating your order of preference.\n- You do not have to fill every checkbox.\n- You must give numbers in ascending preference, for instance, filling in checkboxes with `[1]`, `[2]`, and [`4`] would constitute a spoiled ballot.\n- If you wish to vote for a candidate not listed, please replace the `Write-in` option with the user tag (username followed by 4-digit personal code) and assign it the intended number, otherwise you may not write a number in the 'Write-in' checkbox.\n- If you do not wish to vote for any of the balloted candidates, nor write-in any user, write a `1` in the option for `Blank Vote` and do not make any other modifications.\n- Do not make any other modifications or your vote will constitute a spoiled ballot.\nYou may resubmit a ballot for up to half an hour after voting. Simply copy and paste the updated ballot into your message field.",
        "fields": Ballots.fields(election, user, channels),
        "footer": {
          "text": "Type '!mobile' to receive mobile-friendly versions of your ballots."
        },
        "color": 15844367
      };
      return ballot;
    } catch (e) {
      if (e) throw e;
    }
  }

  static fields(election, user, channels) {
    let fields = [];
    for (let channel of channels) {
      let candidates = election[channel].candidates || [];
      let votingString = Ballots.candidates(candidates);
      fields.push({
        "name": `#${channel} Ballot:`,
        "value": `\`\`\`css\n` +
          `#VoterID: ${user.id}\n` +
          `#ServerID: ${election._id}\n` +
          `#Channel: ${channel}\n` +
          `${votingString}` +
          `[] Write-In\n` +
          `[] Blank Vote\`\`\``,
        "inline": false
      })
    };
    return fields;
  }

  static candidates (candidates) {
    let string = "";
    for (let candidate of candidates.shuffle())
      string += "[] " + candidate + "\n"
    return string;
  }

  static validate(election, user, type = "voters") { //returns an array of channels
    return Object.entries(election) //get rid of the extra properties. if a user object is provided, check if the user is in the voters data
      .filter(([channel, data]) => !channel.startsWith("_") && (!user || Object.keys(data["voters"]).includes(user.id)))
      .map(([channel, data]) => channel);
  }

}

module.exports = Ballots;