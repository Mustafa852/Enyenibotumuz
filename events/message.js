const ayarlar = require('../ayarlar.json');
const db = require("quick.db");
const { EmbedBuilder } = require("discord.js");
let talkedRecently = new Set();

module.exports = async message => {
  // Botun kendisini veya DM mesajlarını yoksay
  if (message.author.bot || !message.guild) return;

  let client = message.client;

  // Spam Koruması (TalkedRecently)
  if (talkedRecently.has(message.author.id)) {
    return;
  }
  talkedRecently.add(message.author.id);
  setTimeout(() => {
    talkedRecently.delete(message.author.id);
  }, 2500); // 2.5 Saniye bekleme süresi

  // Prefix Kontrolü
  let prefix = ayarlar.prefix;
  if (!message.content.startsWith(prefix)) return;

  let command = message.content.split(' ')[0].slice(prefix.length);
  let params = message.content.split(' ').slice(1);
  
  // Yetki Seviyesi (Strom.js içindeki fonksiyonu kullanır)
  let perms = client.elevation(message);
  
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  } else {
    // Benzer komut önerisi sistemi
    try {
        const komutIsimleri = [];
        client.commands.forEach(c => {
            komutIsimleri.push(c.help.name);
            if(c.conf.aliases) c.conf.aliases.forEach(alias => komutIsimleri.push(alias));
        });

        const stringSimilarity = require('string-similarity');
        const matches = stringSimilarity.findBestMatch(command, komutIsimleri);
        
        // Eğer benzerlik oranı %50'den fazlaysa öner
        if (matches.bestMatch.rating > 0.5) {
            return message.reply(`Bunu mu demek istedin? **${prefix}${matches.bestMatch.target}**`);
        }
    } catch (e) {
        // string-similarity modülü yoksa hatayı yut
    }
  }

  if (cmd) {
    // Bakım Modu Kontrolü
    if (cmd.help.name !== 'bakım-modu') {
      const bakimda = await db.fetch(client.user.id); // Check logic
      // Not: Eski kodda boolean ve obje karışık kullanılmış, basitleştirdim.
      const bakimVerisi = await db.fetch(client.user.id + ':)');
      
      if (bakimda === true || bakimVerisi) {
         let timeText = "";
         if(bakimVerisi && bakimVerisi.time) {
             const humanizeDuration = require('humanize-duration');
             const timeDiff = Date.now() - bakimVerisi.time;
             timeText = humanizeDuration(timeDiff, { language: 'tr', round: true });
         }
         
         message.react('❌').catch(e => {});
         return message.reply({ 
             content: `***${client.user.username}*** şu anda bakımda.\n${timeText ? `Yaklaşık ***${timeText} önce*** bakıma alınmış.` : ""}\nBakıma alan: ***${bakimVerisi ? bakimVerisi.author.tag : "Yetkili"}***` 
         });
      }
    }

    // Kara Liste Kontrolü
    let karaliste = await db.fetch(`cokaradalistere_${message.author.id}`);
    if (karaliste) {
        return message.channel.send("Olamaz sen botun karalistesinde bulunuyorsun, botu kullanamazsın. https://discord.gg/fr43SS2n64");
    }

    // Komutu Çalıştır
    try {
        cmd.run(client, message, params, perms);
    } catch (error) {
        console.error(`Komut hatası: ${command}`, error);
    }
  }
};
