const Discord = require("discord.js");
const db = require("quick.db");
const ayarlar = require("../ayarlar.json");
let prefix = ayarlar.prefix;
exports.run = (client, message, args) => {
  const DBL = require('dblapi.js')
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwMzczOTIzNTkyNDk0MzI1OTgiLCJib3QiOnRydWUsImlhdCI6MTY2Nzk5MDgwMH0.Sezi4wTpFeojS_StPFbNix1xo5ykBsvpf-C_IiBAQpM', client)
dbl.hasVoted(message.author.id).then(voted => {
      if(voted) {
  const embed = new Discord.MessageEmbed()
    .setAuthor("Strom | OtoRol", client.user.avatarURL())
    .setColor("#00ff00")
    .addField(
      "__OTOROL Ayarlamak__",
      "__**Oto-Rol-Ayarla**__ 💡 **Otorolü Ayarlar.**\n Örnek: `s!oto-rol-ayarla @rolünüz #logkanalı` \n \n __**s!otorol-msg**__ <:sag:822547800481988628>  **Otorol Mesajını Ayarlar.** \n Örnek: `s!otorol-msg -server-, Sunucumuza Hoşgeldin, -uye-! **-rol-** Adlı Rolün Başarı İle Verildi Seninle Beraber, **-uyesayisi-** Kişiyiz`"
    )

    .addField(
      "__**Kullanabileceğiniz Değişkenler**__",
      `
**-uye-** 💡 \`Üyeyi Etiketler.\`
**-rol-** 💡 \`Rolün İsmini Ekler.\`
**-server-** 💡 \`Server İsmini Yazar.\`
**-uyesayisi-** 💡> \`Üye Sayısını Atar.\`
**-botsayisi-** 💡 \`Bot Sayısını Atar.\`
**-kanalsayisi-** 💡 \`Kanal Sayısını Atar.\`
**-bolge-** 💡 \`Sunucu Bölgesinin İsmini Atar.\`
**-kalanuye-** 💡 \`Hedefe Kaç Kişi Kalmış Gösterir.\`
**-hedefuye-** 💡 \`Hedef Rakamı Gösterir.\`
`
    )
  message.channel.send(embed);
} else {
        message.channel.send(` Bu Komutu Sadece 12 Saatte Bir Oyvererek Kullanabilirsiniz Oyvermek İçin (https://top.gg/bot/1037392359249432598/vote) linke Tıklayarak Oyverebilirsiniz. Oy Verdiyseniz 5 Dakka Bekleyiniz`) 
              .then(Strom => Strom.delete({ timeout: 10000 }));
}
        })
      
      },
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "otorol",
  description: "sayaç",
  usage: "sayaç"
};
