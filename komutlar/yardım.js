const Discord = require("discord.js");
const ayarlar = require("../ayarlar.json");

exports.run = async (client, message) => {
  let prefix = ayarlar.prefix;

  const embed = new Discord.MessageEmbed()
    .setAuthor(`Strom | Yardım Menüsü`)
    .setTitle(``)
    .setColor("RANDOM")
    .setThumbnail(
      "https://cdn.discordapp.com/avatars/854450815149277214/74b8c7ed3f881b718c504a44158bff3d.png"
    )
    .setDescription(
      `🎧 Strom Botumuzu Eklemek İçin \`${prefix}davet\` yazabilirsiniz.`
    )
    .addField(
      `__Genel Komutlar__`,
      `💬 \`${prefix}genel\``,
      true
    )
    .addField(
      `__Sunucu Koruma__`,
      `🔰 \`${prefix}koruma\`  `,
      true
    )
    .addField(
      `__Kullanıcı Komutlar__`,
      `🌀 \`${prefix}kullanıcı\` `,
      true
    )
    .addField(
      `__Oyun Komutları__`,
      ` 🎮 \`${prefix}oyunlar\` `,
      true
    )
    .addField(
      `__Çekiliş Komutlar__`,
      `🎉 \`${prefix}çekiliş\` `,
      true
    )
    .addField(
      `__Eklenti Komutlar__`,
      `🎏 \`${prefix}eklenti\``,
      true
    )
    .addField(
      `__Eğlence Komutlar__`,
      `🎲 \`${prefix}eğlence\``,
      true
    )
  .addField(
      `__test komutları__`,
      `:) \`${prefix}test\``,
      true
    )
    .addField(
      `__Bilgilendirme__`,
          `🔱  \`${prefix}davet\` | Botu Sununuya Davet Edersiniz\n 🔱 \`${prefix}botbilgi\` | Botun İstatistiklerini Görürsünüz \n 🔱 \`${prefix}iletişim\` | Strom  İletişim Bilgileri. \n 🔱 \`${prefix}çağır\` | Sunucunuza yetkili birini çağırır.**Troll amaçlı kullananlar karalisteye alınacak!** \n 🔱 \`${prefix}altyapı\` | **Botunuz için en iyi altyapılar! (owo karşılığı)** ` 
    );
  return message.channel.send(embed);
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "yardım",
  description: "Yardım Menüsü",
  usage: "yardım"
};
