const Strom = require("discord.js");
const ayarlar = require('../ayarlar.json');
const db = require ("quick.db");
let talkedRecently = new Set();

module.exports = async ( message, args) => {
let client = message.client;
  if (talkedRecently.has(message.author.id)) {
    return;
  }
  talkedRecently.add(message.author.id);
	setTimeout(() => {
    talkedRecently.delete(message.author.id);
  }, 0);
  
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  
  
  else {
    const laura = [];
    client.commands.forEach(dropinnem => {
      laura.push(dropinnem.help.name);
      dropinnem.conf.aliases.forEach(abcdef => laura.push(abcdef));
    });

    const rifleman = require('string-similarity').findBestMatch(command, laura);
    message.channel.send(`Doğru kullanımı. **s!${rifleman.bestMatch.target}**`)
  };

  if (cmd) {
 /* if(cmd) kısmının üzerine bunu yazıyorsunuz */
  if(cmd && cmd.help.name !== 'bakım-modu') {
  const neblmölçmedimikamk = await require('quick.db').fetch(client.user.id);
  if(neblmölçmedimikamk == true) {
  var DURATION = require('humanize-duration');
  const chimped = await db.fetch(client.user.id+':)');
  var TIMESTAMP = Date.now() - chimped.time;
  var RESULT = DURATION(TIMESTAMP, { language: 'tr', round: true, conjunction: ', ', serialComma: false });
  message.react('❌');
  return message.reply(`***${client.user.username}*** şu anda bakımda.\nYaklaşık ***${RESULT} önce*** bakıma alınmış.\nBakıma alan: ***${chimped.author.tag}***`);
  };
  };
if (db.fetch(`cokaradalistere_${message.author.id}`)) return message.channel.send("Olamaz sen botun karalistesinde bulunuyorsun botu kullanamazsın. https://discord.gg/fr43SS2n64")
    cmd.run(client, message, params, perms);
  }  
};
