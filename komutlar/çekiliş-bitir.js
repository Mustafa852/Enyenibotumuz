const ms = require('ms');
const db = require('quick.db')
const discord = require('discord.js')

exports.run = async (client, message, args) => {
 if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(new discord.MessageEmbed().setDescription(` Bu komutu kullanabilmek için \`yönetici\` yetkisine sahip olmalısın`).setColor("RANDOM"));
    if(!args[0]){
        return message.channel.send(':x: Lütfen Yapılan Çekilişin Mesaj IDsini Belirtin!').then(m => m.delete({timeout: 5000, reason:"Yapılması gerekiyordu"}));
                message.delete({timeout: 6000, reason:"Yapılması gerekiyordu"});
    }

    let giveaway = 
    client.giveawaysManager.giveaways.find((g) => g.prize === args.join(' ')) ||
    client.giveawaysManager.giveaways.find((g) => g.messageID === args[0]);

    if(!giveaway){
        return message.channel.send('Çekiliş Mesajı Bulunamadı `'+ args.join(' ') + '`.').then(m => m.delete({timeout: 5000, reason:"Yapılması gerekiyordu"}));
                message.delete({timeout: 6000, reason:"Yapılması gerekiyordu"});
    }

    client.giveawaysManager.edit(giveaway.messageID, {
        setEndTimestamp: Date.now()
    })
    .then(() => {

        message.channel.send('Çekiliş Başarıyla Sona Erdirildi!').then(m => m.delete({timeout: 5000, reason:"Yapılması gerekiyordu"}));
                message.delete({timeout: 6000, reason:"Yapılması gerekiyordu"});
    })
    .catch((e) => {
        if(e.startsWith(`${giveaway.messageID} ID'li Çekiliş Sona Ermedi.`)){
            message.channel.send('Çekiliş Başarıyla Sonlandırıldı!');
        } else {
            console.error(e);
            message.channel.send('Bir Hata Oluştu...');
        }
    });

};

exports.conf = {
  aliases: ['end'],
  permLevel: 0,
};
exports.help = {
  name: 'sonlandır',
   description: 'Çekilişi Sonlandırır.',
  usage: 'end <mesajID>'
};