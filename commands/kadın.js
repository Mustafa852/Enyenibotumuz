const Discord = require("discord.js");
const db = require("quick.db");
const ayarlar = require("../ayarlar.json")

module.exports.run = async (client, message, args) => {
    if(ayarlar.yetkiliRol.some(arwene => message.member.roles.cache.has(arwene)) && !message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(`${client.guild.emojis.cache.get(ayarlar.no)} **Bu işlemi kullanmak için gerekli yetkin yok!**`).then(message.react(client.emojis.cache.get(ayarlar.no)))

    const etiketlenenKişi = message.mentions.members.first() || message.guild.members.cache.get(args[1])
if(!etiketlenenKişi) return message.channel.send(`${client.guild.emojis.cache.get(ayarlar.no)} **Kaydetmek için bir kişi etiketlemelisin!**`).then(message.react(client.emojis.cache.get(ayarlar.no)))

const isim = args[1];
const yaş = args[2];
if(!isim) return message.channel.send(`${client.guild.emojis.cache.get(ayarlar.no)} **Kaydetmek için bir isim belirtmelisin!**`).then(message.react(client.emojis.cache.get(ayarlar.no)))
if(!yaş) return message.channel.send(`${client.guild.emojis.cache.get(ayarlar.no)} **Kaydetmek için bir yaş belirtmelisin!**`).then(message.react(client.emojis.cache.get(ayarlar.no)))
if(isNaN(yaş)) return message.channel.send(`${client.guild.emojis.cache.get(ayarlar.no)} **Belirttiğin yaş rakamlardan oluşmalı!**`).then(message.react(client.emojis.cache.get(ayarlar.no)))

etiketlenenKişi.roles.add(ayarlar.erkekRol1)
etiketlenenKişi.roles.add(ayarlar.erkekRol2)
etiketlenenKişi.roles.remove(ayarlar.kayıtsızRol)
etiketlenenKişi.setNickname(`${ayarlar.tag} ${isim} ${ayarlar.sembol} ${yaş}`)

message.react(client.emojis.cache.get(ayarlar.yes))

const arwEmbed = new Discord.MessageEmbed()
.setColor("RANDOM")
.setDescription(`Kullanıcının ismi ${ayarlar.tag} ${isim} ${ayarlar.sembol} ${yaş} olarak değiştirildi ve <@&${ayarlar.kadınRol1}>, <@&${ayarlar.kadınRol2}> rolleri verildi!`)
.setFooter(ayarlar.footer)
.setAuthor(message.member.displayName, message.author.avatarURL({dynamic: true}))//Matthe arweneyi çok seviyorrr
.setTimestamp()

message.channel.send(arwEmbed)

db.push(`isimler.${etiketlenenKişi.id}`, {
İsim: isim,
Yaş: yaş,
Yetkili: message.author
})

db.add(`kadinTeyit.${etiketlenenKişi.id}`, `1`)
db.add(`toplamTeyit.${etiketlenenKişi.id}`, `1`)

client.channels.cache.get(ayarlar.sohbetKanal).send(`${etiketlenenKişi} **kaydolarak sunucuya giriş yaptı. Hoşgeldin!**`)
  
}
exports.config = {
    name: "kadın",
    guildOnly: true,
    aliases: ["k", "kız", "female"]
}