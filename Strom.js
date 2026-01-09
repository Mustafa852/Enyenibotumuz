const express = require("express");
const app = express();
app.get("/foo", (req, res, next) => {
    try {
        const foo = JSON.parse(req.body.jsonString);
    } catch (e) {}
    res.sendStatus(200);
});
process.on("unhandledRejection", (reason, promise) => { console.log(reason) });

const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection, 
    EmbedBuilder, 
    AuditLogEvent,
    PermissionsBitField,
    ChannelType
} = require('discord.js');

const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
const Jimp = require('jimp');
const Database = require("./Helpers/Database");
const Invites = new Collection(); 
const fs = require('fs');
const db = require('quick.db');
const path = require('path');
// snekfetch v14 ile uyumlu degildir, node-fetch kullanilir
const fetch = require('node-fetch'); 
const ms = require('ms');
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");

// V14 CLIENT TANIMLAMASI
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildEmojisAndStickers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Eski kod uyumluluğu için değişken eşitleme
const bot = client;
const Strom = require('discord.js'); // Bazı yerlerde Strom.Collection kullanılmış

require('./util/eventLoader.js')(client);
require("moment-duration-format");
// require("./komut.js")(bot); // Eğer bu dosya v12 ise hata verebilir, gerekirse kapat
require("./yanıtlama");

const newUsers = new Collection();
client.commands = new Collection();
client.aliases = new Collection();

module.exports = {
  bot: bot,
  Discord: Strom
};

let prefix = ayarlar.prefix;

client.ekoayarlar = {
  parabirimi: "TL", 
  botunuzunprefixi: "s!",
  botunuzunidsi: "756883309270663229",
  botismi: "Strom",
  renk: "Random", 
  isimsiz: "Bilinmiyor", 
  rastgelepara: false, 
  minpara: 101, 
  maxpara: 150, 
  günlükpara: 130, 
  dbloy: true, 
  dblkey: "https://top.gg/bot/756883309270663229/vote", 
  dblmsj: "Bu komutu kullanabilmek için bota oy vermelisiniz. Oy vermek için soyver", 
  başlangıçparası: 101, 
  admin: ["846736343593779230"]
}

const log = message => {
    console.log(`${message}`);
};

// Komut Yükleyici
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`${props.help.name} Komutu Yüklendi.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});

client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) return;
    let permlvl = 0;
    if (message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) permlvl = 2;
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

// Token girişi
client.login(ayarlar.token || process.env.Token);

//---------- EVENTS BAŞLANGIÇ ------------//

// Ototag
client.on('guildMemberAdd', async member => {
  let tag = await db.fetch(`tag_${member.guild.id}`);
  if (tag) {
     member.setNickname(`${tag} | ${member.user.username}`).catch(() => {});
  } else {
     member.setNickname(`${member.user.username}`).catch(() => {});
  }
});

// Bot Etiketlendiğinde Prefix
client.on('messageCreate', message => {
    if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
        message.reply({ content: `Prefix'im: **${prefix}**, Yardım için: **${prefix}yardım**\n__**https://discord.gg/FV2rwt6GRF**__ Tarafından kodlandım!` });
    }
});

// Kanal Koruma
client.on("roleDelete", async role => {
  let synx2 = await db.fetch(`synx_${role.guild.id}`);
  if (synx2) {
    const entry = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete }).then(audit => audit.entries.first());
    if (entry && entry.executor.id == client.user.id) return;
    
    role.guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        permissions: role.permissions,
        mentionable: role.mentionable,
        position: role.position,
        reason: "Silinen Roller Tekrar Açıldı."
    });
  }
});

client.on("roleCreate", async role => {
  let synx = await db.fetch(`synx_${role.guild.id}`);
  if (synx) {
    const entry = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate }).then(audit => audit.entries.first());
    if (entry && entry.executor.id == client.user.id) return;
    role.delete();
  }
});

client.on("channelDelete", async function(channel) {
  let rol = await db.fetch(`kanalk_${channel.guild.id}`);
  if (rol) {
    let channelp = channel.parentId;
    channel.clone().then(z => {
      if(channelp) z.setParent(channelp);
    });
  }
});

// Emoji Koruma
client.on("emojiDelete", async (emoji) => {
  let emojik = await db.fetch(`emojik_${emoji.guild.id}`);
  if (emojik) {
    const entry = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete }).then(audit => audit.entries.first());
    if (entry && entry.executor.id == client.user.id) return;
    if (entry && entry.executor.id == emoji.guild.ownerId) return;
    
    const executor = await emoji.guild.members.fetch(entry.executor.id).catch(() => null);
    if (executor && !executor.permissions.has(PermissionsBitField.Flags.Administrator)) { 
      emoji.guild.emojis.create({ attachment: emoji.url, name: emoji.name }).catch(console.error);
    }
  }
});

// Küfür Engel
const küfür = ["siktir", "fuck", "puşt", "pust", "piç", "sikerim", "sik", "yarra", "yarrak", "amcık", "orospu", "orosbu", "orosbucocu", "oç", ".oc", "ibne", "yavşak", "bitch", "dalyarak", "amk", "awk", "taşak", "taşşak", "daşşak", "sikm", "sikim", "sikmm", "skim", "skm", "sg"];

client.on("messageUpdate", async (old, nev) => {
  if (!nev.guild || !nev.content) return;
  if (old.content === nev.content) return;
  
  let i = await db.fetch(`küfür.${nev.guild.id}.durum`);
  let y = await db.fetch(`küfür.${nev.guild.id}.kanal`);
  
  if (i) {
      if (küfür.some(word => nev.content.toLowerCase().includes(word))) {
        if (nev.member && nev.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        
        const embed = new EmbedBuilder()
          .setColor("#00ff00")
          .setDescription(`${nev.author} , **Mesajını editleyerek küfür etmeye çalıştı!**`)
          .addFields({ name: "Mesajı:", value: `${nev.content}` });

        try { await nev.delete(); } catch(e){}
        
        const uyari = new EmbedBuilder().setColor("#00ff00").setDescription(`${nev.author} , **Mesajı editleyerek küfür etmene izin veremem!**`);
        nev.channel.send({ embeds: [uyari] }).then(msg => setTimeout(() => msg.delete(), 5000));
        
        if(y) {
           const logKanal = client.channels.cache.get(y);
           if(logKanal) logKanal.send({ embeds: [embed] });
        }
      }
  }
});

client.on("messageCreate", async msg => {
  if (msg.author.bot || !msg.guild) return;
  let y = await db.fetch(`küfür.${msg.guild.id}.kanal`);
  let i = await db.fetch(`küfür.${msg.guild.id}.durum`);
  
  if (i) {
    if (küfür.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
           try { await msg.delete(); } catch(e){}
           
           const embeds = new EmbedBuilder()
            .setColor("#00ff00")
            .setDescription(`<@${msg.author.id}> , **Bu sunucuda küfür yasak!**`);
           
           msg.channel.send({ embeds: [embeds] }).then(m => setTimeout(() => m.delete(), 5000));
           
           const embed = new EmbedBuilder()
            .setColor("#00ff00")
            .setDescription(`${msg.author} , **Küfür etmeye çalıştı!**`)
            .addFields({ name: "Mesajı:", value: `${msg.content}` });
            
           if(y) client.channels.cache.get(y)?.send({ embeds: [embed] });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// Bot İstatistikleri
client.on('ready', () => {
 setInterval(() => {
    const calismasure = moment.duration(client.uptime).format(" D [gün], H [saat], m [dakika], s [saniye]");
    let botdurum = client.channels.cache.get('826129251690086420');
    if(botdurum) {
        const botistatistik = new EmbedBuilder()
        .setColor('Red')
        .setTitle('= Bot İstatistikleri =')
        .addFields(
            { name: 'RAM', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}/512mb` },
            { name: 'Çalışma Süresi', value: `${calismasure}` },
            { name: 'Ping', value: `${client.ws.ping}` },
            { name: 'Bilgi', value: `${client.guilds.cache.size.toLocaleString()} sunucu ve ${client.users.cache.size} kullanıcıya hizmet veriyor.` }
        )
        .setTimestamp()
        .setFooter({ text: 'Strom' });
        
        botdurum.send({ embeds: [botistatistik] });
    }
  }, 3600000);
});

// Davet Sistemi
const guildInvites = new Map();

client.on("ready", () => {
  client.guilds.cache.forEach(guild => {
    guild.invites.fetch()
    .then(invites => guildInvites.set(guild.id, invites))
    .catch(err => console.log(err));
  });
});

client.on('inviteCreate', async invite => {
  guildInvites.set(invite.guild.id, await invite.guild.invites.fetch());
});

client.on('guildMemberAdd', async member => {
  const cachedInvites = guildInvites.get(member.guild.id);
  const newInvites = await member.guild.invites.fetch();
  guildInvites.set(member.guild.id, newInvites);
  try {
    const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code).uses < inv.uses);
    if(usedInvite) {
        const currentInvites = await db.get(`inv.${usedInvite.inviter.id}.total`)
        if(currentInvites) {
          db.set(`inv.${member.id}.inviter`, usedInvite.inviter.id)
          db.add(`${usedInvite.inviter.id}`, 1)
        } else {
          db.set(`inv.${usedInvite.inviter.id}.total`, 1)
          db.set(`inv.${member.id}.inviter`, usedInvite.inviter.id)
        }
    }
  } catch(err) {
    console.log(err);
  }
});

client.on('guildMemberRemove', async member => {
  const inviter = await db.get(`inv.${member.id}.inviter`)
  if(inviter) {
      try {
        db.add(`inv.${inviter}.total`, -1)
        db.delete(`inv.${member.id}.inviter`)
      } catch(err) {
        console.log(err);
      }
  }
});

// Eski Davet Sistemi (Invites)
const invites = {};
const wait = require("util").promisify(setTimeout);

client.on("ready", () => {
  wait(1000);
  client.guilds.cache.forEach(g => {
    g.invites.fetch().then(guildInvites => {
      invites[g.id] = guildInvites;
    });
  });
});

client.on("guildMemberRemove", async member => {
  let kanal = await db.fetch(`davetkanal_${member.guild.id}`);
  if (!kanal) return;
  
  let d = await db.fetch(`bunudavet_${member.id}`);
  const sa = await client.users.fetch(d).catch(() => null);
  
  if (!d || !sa) {
    const aa = new EmbedBuilder()
      .setColor("Black")
      .setDescription(`\`\`${member.user.tag}\`\` **adlı kullanıcı aramızdan ayrıldı.\nŞahsı davet eden:** \`\`Bulunamadı!\`\``)
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
    
    client.channels.cache.get(kanal)?.send({ embeds: [aa] });
  } else {
    const aa = new EmbedBuilder()
      .setColor("Black")
      .setDescription(`\`\`${member.user.tag}\`\` **adlı kullanıcı aramızdan ayrıldı.\nŞahsı davet eden:** \`\`${sa.tag}\`\``)
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
      
    client.channels.cache.get(kanal)?.send({ embeds: [aa] });
    // Rol alma mantığı burada devam ettirilebilir...
  }
});

client.on("guildMemberAdd", async member => {
  member.guild.invites.fetch().then(async guildInvites => {
    let kanal = await db.fetch(`davetkanal_${member.guild.id}`);
    if (!kanal) return;
    
    const ei = invites[member.guild.id];
    invites[member.guild.id] = guildInvites;

    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    if(invite) {
        const davetçi = await client.users.fetch(invite.inviter.id);

        db.add(`davet_${invite.inviter.id}_${member.guild.id}`, +1);
        db.set(`bunudavet_${member.id}`, invite.inviter.id);
        let sayı2 = await db.fetch(`davet_${invite.inviter.id}_${member.guild.id}`) || 0;

        const aa = new EmbedBuilder()
          .setColor("Black")
          .setDescription(`\`\`${member.user.tag}\`\` **adlı kullanıcı sunucuya katıldı.\nŞahsı davet eden:** \`\`${davetçi.tag}\`\`\n**Toplam \`\`${sayı2}\`\` daveti oldu!**`)
          .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
        
        client.channels.cache.get(kanal)?.send({ embeds: [aa] });
    }
  });
});

// AFK Sistemi
client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild) return;
  if (message.content.includes(`afk`)) return;

  if (await db.fetch(`afk_${message.author.id}`)) {
    db.delete(`afk_${message.author.id}`);
    db.delete(`afk_süre_${message.author.id}`);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setDescription(`${message.author.username} Artık \`AFK\` Değilsin.`);

    message.channel.send({ embeds: [embed] });
  }

  var USER = message.mentions.users.first();
  if (USER) {
      var REASON = await db.fetch(`afk_${USER.id}`);
      if (REASON) {
        let süre = await db.fetch(`afk_süre_${USER.id}`);
        let timeObj = ms(Date.now() - süre);
        const afk = new EmbedBuilder()
          .setColor("Random")
          .setDescription(`**Bu Kullanıcı AFK**\n\n**Afk Olan Kullanıcı :** \`${USER.tag}\`\n**Afk Süresi :** \`${timeObj}\`\n**Sebep :** \`${REASON}\``);
        message.channel.send({ embeds: [afk] });
      }
  }
});

// Reklam Engel
const reklam = [".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", ".gl", ".org", ".com.tr", ".biz", ".rf", ".gd", ".az", ".party"];

client.on("messageUpdate", async (old, nev) => {
  if (!nev.content) return;
  if (old.content != nev.content) {
    let i = await db.fetch(`reklam.${nev.guild.id}.durum`);
    let y = await db.fetch(`reklam.${nev.guild.id}.kanal`);
    if (i) {
      if (reklam.some(word => nev.content.includes(word))) {
        if (nev.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
        
        const embed = new EmbedBuilder()
          .setColor("#00ff00")
          .setDescription(`${nev.author} , **Mesajını editleyerek reklam yapmaya çalıştı!**`)
          .addFields({ name: "Mesajı:", value: `${nev.content}` });

        try { await nev.delete(); } catch(e){}
        const embeds = new EmbedBuilder().setColor("#00ff00").setDescription(`${nev.author} , **Mesajı editleyerek reklam yapamana izin veremem!**`);
        
        if(y) client.channels.cache.get(y)?.send({ embeds: [embed] });
        nev.channel.send({ embeds: [embeds] }).then(msg => setTimeout(() => msg.delete(), 5000));
      }
    }
  }
});

client.on("messageCreate", async msg => {
  if (msg.author.bot || !msg.guild) return;
  
  let y = await db.fetch(`reklam.${msg.guild.id}.kanal`);
  let i = await db.fetch(`reklam.${msg.guild.id}.durum`);
  
  if (i) {
    if (reklam.some(word => msg.content.toLowerCase().includes(word))) {
      try {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          try { await msg.delete(); } catch(e){}
          
          const embeds = new EmbedBuilder().setColor("#00ff00").setDescription(`<@${msg.author.id}> , **Bu sunucuda reklam yapmak yasak!**`);
          msg.channel.send({ embeds: [embeds] }).then(msg => setTimeout(() => msg.delete(), 5000));
          
          const embed = new EmbedBuilder().setColor("#00ff00").setDescription(`${msg.author} , **Reklam yapmaya çalıştı!**`).addFields({ name: "Mesajı:", value: `${msg.content}` });
          if(y) client.channels.cache.get(y)?.send({ embeds: [embed] });
        }
      } catch (err) { console.log(err); }
    }
  }
});

// Anti Raid
client.on("guildMemberAdd", async member => {
  let kanal = (await db.fetch(`antiraidK_${member.guild.id}`)) == "anti-raid-aç";
  if (!kanal) return;
  
  // v14 fetchOwner kullanımı
  const owner = await member.guild.fetchOwner();
  
  if (member.user.bot) {
    if (db.fetch(`botizin_${member.guild.id}.${member.id}`) == "aktif") {
      let synx = new EmbedBuilder()
        .setColor("Random")
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(`**${member.user.tag}** (${member.id}) adlı bota bir yetkili izin verdi.`);
      owner.send({ embeds: [synx] });
    } else {
      let izinverilmemişbot = new EmbedBuilder()
        .setColor("Random")
        .setThumbnail(member.user.displayAvatarURL())
        .setDescription(`**${member.user.tag}** adlı bot sunucuya eklendi ve banladım. İzin için: **s!bot-izni ver <botid>**`);
      
      member.kick().catch(e => {});
      owner.send({ embeds: [izinverilmemişbot] });
      
      let antikanal = db.fetch(`antiraid_${member.guild.id}`);
      let prefix2 = await db.fetch(`prefix.${member.guild.id}`) || ayarlar.prefix;

      if(antikanal) {
        var embed = new EmbedBuilder().setDescription(`**Sunucuya Bir Bot Eklendi Anti Raid Sistemi Aktif Olduğundan Bot Atıldı.**`).setColor("Random");
        member.guild.channels.cache.get(antikanal)?.send({ embeds: [embed] }); 
      }
    }
  }
});

// İsim Reklam Engel
client.on('guildMemberAdd', async youthanasia => {
    if (db.has(`isimreklamkoruma.${youthanasia.guild.id}`) && youthanasia.user.username.toLowerCase().replace(/ /g, '').includes('discord.gg')) {
      try { await youthanasia.send('İsminde reklam içerikli bir şey olabileceğinden dolayı seni yasakladım.'); } catch(e){}
      youthanasia.ban({ reason: 'Reklam içerikli kullanıcı adı.' }).catch(e=>{});
    }
});

// Sayaç
client.on("guildMemberAdd", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = client.channels.cache.get(skanal9);
  if (!skanal31) return;
  
  const geldi = new EmbedBuilder()
    .setColor('#f6ff00')
    .setThumbnail(member.user.displayAvatarURL({dynamic : true}))
    .addFields({ name: `***╭−−−−−−−−−−− \`『 °Spallers Sayaç° 』\` −−−−−−−−−−−−╮ ***`, value: `
**┊** 🚪 **${member}** Sunucuya Katıldı
**┊** 🚪 **${sayac}** Kişi Olmamıza **${sayac - member.guild.memberCount}** Kişi Kaldı
**┊** 🚪 Toplam **${member.guild.memberCount}** Kişiyiz !
**╰−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−╯**`});
  skanal31.send({ embeds: [geldi] });
});

client.on("guildMemberRemove", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = client.channels.cache.get(skanal9);
  if (!skanal31) return;
  
  const gitti = new EmbedBuilder()
    .setColor('#f6ff00')
    .setThumbnail(member.user.displayAvatarURL({dynamic : true}))
    .addFields({ name: `***╭−−−−−−−−−−− \`『 °Spallers Sayaç° 』\` −−−−−−−−−−−−╮ ***`, value: `
**┊** <a:cikis:780165054435426324> **${member}** Sunucudan Ayrıldı
**┊** <a:cikis:780165054435426324> **${sayac}** Kişi Olmamıza **${sayac - member.guild.memberCount}** Kişi Kaldı
**┊** <a:cikis:780165054435426324> Toplam **${member.guild.memberCount}** Kişiyiz !
**╰−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−╯**`});
  skanal31.send({ embeds: [gitti] });
});

// Capslock Engel
client.on("messageCreate", async msg => {
    if (msg.channel.type === ChannelType.DM || msg.author.bot) return;
    if (msg.content.length > 4) {
         if (db.fetch(`capslock_${msg.guild.id}`)) {
           let caps = msg.content.toUpperCase();
           if (msg.content == caps) {
             if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
               try { await msg.delete(); } catch(e){}
               msg.channel.send(`<a:no2:823900130117812254> ${msg.author}, Bu sunucuda, büyük harf Kullanamazsın!`).then(m => setTimeout(() => m.delete(), 5000));
             }
           }
         }
    }
});

// Mute Role Delete Check
client.on('roleDelete', async role => {
    const data = await require('quick.db').fetch(`strom-mute-role.${role.guild.id}`);
    if(data && data === role.id) require('quick.db').delete(`strom-mute-role.${role.guild.id}`); 
});

// ModLog Sistemi
client.on("messageDelete", async (message) => {
  if (message.author?.bot || !message.guild) return;
  let log = message.guild.channels.cache.get(await db.fetch(`log_${message.guild.id}`));
  if (!log) return;

  const embed = new EmbedBuilder()
    .setTitle(message.author.username + " | Mesaj Silindi")
    .addFields(
        { name: "Kullanıcı: ", value: `${message.author}` },
        { name: "Kanal: ", value: `${message.channel}` },
        { name: "Mesaj: ", value: `${message.content || "Görsel"}` }
    );
  log.send({ embeds: [embed] });
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.guild || !newMessage.content) return;
  let modlog = await db.fetch(`log_${oldMessage.guild.id}`);
  if (!modlog) return;

  let embed = new EmbedBuilder()
  .setAuthor({ name: oldMessage.author.username, iconURL: oldMessage.author.displayAvatarURL() })
  .addFields(
      { name: "**Eylem:**", value: "Mesaj Düzenleme" },
      { name: "**Mesajın sahibi:**", value: `<@${oldMessage.author.id}> === **${oldMessage.author.id}**` },
      { name: "**Eski Mesajı:**", value: `${oldMessage.content}` },
      { name: "**Yeni Mesajı:**", value: `${newMessage.content}` }
  )
  .setTimestamp()
  .setColor(0x36393F);
  
  client.channels.cache.get(modlog)?.send({ embeds: [embed] });
});

// Kanal / Rol / Emoji Logları (Örnek olarak Channel Create)
client.on("channelCreate", async(channel) => {
  if(!channel.guild) return;
  let modlog = await db.fetch(`log_${channel.guild.id}`);
  if (!modlog) return;
  const entry = await channel.guild.fetchAuditLogs({type: AuditLogEvent.ChannelCreate}).then(audit => audit.entries.first());
  
  let kanalTuru = channel.type === ChannelType.GuildText ? `<#${channel.id}>` : `\`${channel.name}\``;

  let embed = new EmbedBuilder()
    .setAuthor({ name: entry.executor.username, iconURL: entry.executor.displayAvatarURL() })
    .addFields(
        { name: "**Eylem:**", value: "Kanal Oluşturma" },
        { name: "**Kanalı Oluşturan Kişi:**", value: `<@${entry.executor.id}>` },
        { name: "**Oluşturduğu Kanal:**", value: `${kanalTuru}` }
    )
    .setTimestamp()
    .setColor(0x36393F);
  
  client.channels.cache.get(modlog)?.send({ embeds: [embed] });
});

// Otorol
client.on("guildMemberAdd", async member => {
  let kanal = await db.fetch(`otoRK_${member.guild.id}`);
  let rol = await db.fetch(`otoRL_${member.guild.id}`);
  let mesaj = db.fetch(`otoRM_${member.guild.id}`);
  if (!rol) return;

  if (!mesaj) {
    client.channels.cache.get(kanal)?.send(":loudspeaker: :inbox_tray: Otomatik Rol Verildi Seninle Beraber `" + member.guild.memberCount + "` Kişiyiz! Hoşgeldin! `" + member.user.username + "`");
    return member.roles.add(rol).catch(() => {});
  }

  if (mesaj) {
    var mesajs = mesaj
      .replace("-uye-", `${member.user}`)
      .replace("-uyetag-", `${member.user.tag}`)
      .replace("-rol-", `${member.guild.roles.cache.get(rol)?.name}`)
      .replace("-server-", `${member.guild.name}`)
      .replace("-uyesayisi-", `${member.guild.memberCount}`);
    
    member.roles.add(rol).catch(() => {});
    return client.channels.cache.get(kanal)?.send(mesajs);
  }
});

// Çekiliş (Giveaways)
const { GiveawaysManager } = require('discord-giveaways');
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "./giveaways.json",
    default: {
        botsCanWin: false,
        embedColor: "#FF0000",
        embedColorEnd: "#000000",
        reaction: "🎉"
    }
});

// Güvenlik (Hesap Yaşı Kontrolü)
client.on("guildMemberAdd", member => {
  let kanal = db.fetch(`güvenlik.${member.guild.id}`);
  if (!kanal) return;

  let süre = member.user.createdTimestamp;
  let kontrol;
  if (Date.now() - süre < 1296000000) kontrol = "`Bu hesap şüpheli!` 🚨"; // 15 gün
  else kontrol = "`Bu hesap güvenli!` ✔️";

  let codare = new EmbedBuilder()
    .setColor("Random")
    .setTitle(`${member.user.username} Katıldı`)
    .setDescription(`<@${member.id}> Bilgileri ➡️ \n\n __Hesap durumu__ ➡️ \n\n**${kontrol}**`);
    
  client.channels.cache.get(kanal)?.send({ embeds: [codare] });
});

// Spam Engel (Basit Halde)
client.on('messageCreate', async message => {
    if(message.author.bot || !message.guild) return;
    const spam = await db.fetch(`spam.${message.guild.id}`);
    if(!spam) return;
    
    const maxTime = await db.fetch(`max.${message.guild.id}.${message.author.id}`);
    const timeout = await db.fetch(`time.${message.guild.id}.${message.author.id}`);
    db.add(`mesaj.${message.guild.id}.${message.author.id}`, 1);
    
    if(timeout) {
        if(Date.now() < maxTime) {
             const embed = new EmbedBuilder()
              .setColor(0x36393F)
              .setDescription(` <@${message.author.id}> , **Bu sunucuda spam yapmak yasak!**`);
             
             if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                 message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 2000));
                 return message.delete().catch(() => {});
             }
        }
    } else {
        db.set(`time.${message.guild.id}.${message.author.id}`, 'ok');
        db.set(`max.${message.guild.id}.${message.author.id}`, Date.now()+3000);
        setTimeout(() => {
            db.delete(`mesaj.${message.guild.id}.${message.author.id}`);
            db.delete(`time.${message.guild.id}.${message.author.id}`);
        }, 500);
    }
});

// Hata Yakalama
process.on('uncaughtException', error => {
    console.error('Beklenmedik bir hata:', error);
});
