const Parse = require("../util/parse.js");
const DBuser = require("../util/dbuser.js");

class ASL extends Parse {

  constructor(message) {
    super(message);
  }

  async run(args, dbuser) {
    try {
      if (args.length === 0) return this.output(dbuser);
      if (args.length === 1) {
        if (args[0] === "clear") { //clear asl values
          if (dbuser.age) delete tally[dbindex].age;
          if (dbuser.sex) delete tally[dbindex].sex;
          if (dbuser.location) delete tally[dbindex].location;
          if (dbuser.modverified) delete tally[dbindex].modverified; //delete mod given tick
          DBuser.setData(dbuser);
          this.Output.generic(`Data on **age**, **sex**, and **location** cleared for **${this.user.tag}**.`)
        } else throw "Incorrect number of parameters specified. Please specify **age**, **sex**, and **location**.";
        return;
      };
      if (args.length === 3) {
        let [age, sex, location] = args;
        console.log(age, sex, location);
        if (isNaN(age) && age !== "-") throw "Please specify a number for **age**.";
        age = age === "-" ? "" : age;
        sex = sex === "-" ? "" : sex.toLowerCase();
        location = location === "-" ? "" : location;
        if (!age) delete dbuser.age;
        else dbuser.age = age; //if "-" argument, delete it, otherwise set it
        if (!sex) delete dbuser.sex;
        else dbuser.sex = sex;
        if (!location) delete dbuser.location;
        else dbuser.location = location;
        if (dbuser.modverified) delete tally[dbindex].modverified;
        DBuser.setData(dbuser);
        this.output(dbuser);
      }
    } catch (e) {
      if (e) this.Output.onError(e);
    }
  }

  async output(dbuser) {
    try {
      let asl = "",
        aslarray = [];
      aslarray.push(
        dbuser.age ? `**${dbuser.age}** years old` : ``,
        dbuser.sex ? `**${dbuser.sex}**` : ``,
        dbuser.location ? `from **${dbuser.location}**` : ``
      );
      aslarray.clean();
      for (let i = 0; i < aslarray.length; i++) {
        if (!aslarray[i]) aslarray.remove(i);
        asl += aslarray[i] +
          (i >= aslarray.length - 1 ? "" :
            (i < aslarray.length - 2 ? ", " :
              (aslarray.length === 3 ? "," : ``) +
              " and ")
          ); //punctuation, just go with it
      };
      if (asl) this.Output.generic(`Hello **${this.author.username}**, I see you're ${asl}.`);
      else throw "No **age**, **sex**, and **location** found, please specify.";
    } catch (e) {
      this.Output.onError(e);
    }
  }

}

module.exports = ASL;

Array.prototype.clean = function () {
  for (let i = 0; i < this.length; i++) {
    if (!this[i]) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
}

Array.prototype.remove = function (index) {
  if (!index && index !== 0) return;
  if (Array.isArray(index)) {
    index.sort(function (a, b) {
      return b - a;
    })
    for (let i = 0; i < index.length; i++) {;
      this.splice(index[i], 1);
    }
  } else {
    this.splice(index, 1);
  }
  return this;
}