const { SlashCommandBuilder, User, EmbedBuilder } = require("discord.js");
const { UserRupes } = require("../model");
const { Parse } = require("../func");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rupes")
        .setDescription("Comando de economia")
        .addSubcommand(sub => 
            sub
                .setName("bolsa") 
                .setDescription("Pega o bolsa familia diario")   
        )
        .addSubcommand(sub => 
            sub
                .setName("carteira")
                .setDescription("Mostra a sua carteira ou de outra pessoa")    
                .addUserOption(op => {
                    return op
                        .setName("pessoinha")
                        .setDescription("Uma pessoa do server ou não")
                })
        ),
    async execute(interaction, client){
        if(interaction.options.getSubcommand() === "bolsa"){
            let data = await UserRupes.findOne({userid: interaction.user.id});
            let user;
            let rupes = Math.floor(Math.random() * 1000);

            if(!data){
                user = new UserRupes({userid: interaction.user.id, xp: 0.0, lv: 1, box: [], guilds: [], rupes: 0, daily: 0});
                user.save();
            }else {
                user = new UserRupes({userid: data.userid, rupes: data.rupes, box: data.box, guilds: data.guilds, lv: data.lv, xp: data.xp, daily: data.daily});
            }

            let time = Parse(user.daily - (Date.now() - 86400000));
            if((time.seconds <= 0 && time.minutes <= 0 && time.hours <= 0) || (user.daily == 0)){
                let embed = new EmbedBuilder()
                    .setTitle("O BOLSA FAMILIA CHEGOU")
                    .setDescription(`É o dia de fazer o ***l*** , já que você ganhou ${rupes} rupes`)
                    .setImage("https://64.media.tumblr.com/1e96a058602423556bd14ccfee3fa749/tumblr_pzlibg2SpL1xuqm6qo2_540.gif")
                    .setColor("Green")
                    .setAuthor({name: "molusco", iconURL: client.user.displayAvatarURL(), url: "https://www.youtube.com/watch?v=KWP8pQnGoBw"})
                    .setFooter({text: "Serio já criei esse comando inumeras vezes"})
                await interaction.reply({embeds: [embed]});
                await UserRupes.updateOne({userid: interaction.user.id}, {$inc: {rupes: rupes}, $set: {daily: Date.now()}});
            }else {
                let embed = new EmbedBuilder()
                    .setTitle("O BOLSA FAMILIA NÃO CAIU")
                    .setDescription(`Ainda falta ***${time.hours == 0 ? "" : time.hours+" horas"}*** ***${time.minutes == 0 ? "" : time.minutes+" minutos"}***  ***${time.seconds == 0 ? "" : time.seconds+" segundos"}***`)
                    .setImage("https://gifdb.com/images/high/no-money-anime-ey0ap3xauza7cjf0.gif")
                    .setColor("Green")
                    .setAuthor({name: "molusco", iconURL: client.user.displayAvatarURL(), url: "https://www.youtube.com/watch?v=KWP8pQnGoBw"})
                    .setFooter({text: "Serio já criei esse comando inumeras vezes"})
                await interaction.reply({embeds: [embed]});
            }
        }else if(interaction.options.getSubcommand() === "carteira"){
            let author = interaction.options.getUser("pessoinha") || interaction.user;
            let data = await UserRupes.findOne({userid: author.id});
            let user;

            if(!data){
                user = new UserRupes({userid: author.id, xp: 0.0, lv: 1, box: [], guilds: [], rupes: 0, daily: 0});
                user.save();
            }else {
                user = new UserRupes({userid: data.userid, rupes: data.rupes, box: data.box, guilds: data.guilds, lv: data.lv, xp: data.xp, daily: data.daily});
            }

            let time = Parse(user.daily - (Date.now() - 86400000));
            let embed = new EmbedBuilder()
                .setTitle(`${time.seconds == 0 && time.minutes == 0 && time.hours == 0 ? " Está na hora do seu bolsa familia" : "Ainda não está na hora do bolsa familia"}`)
                .setDescription(`O ${author.tag} tem ${user.rupes} rupes`)
                .setColor("Green")
                .setAuthor({name: "molusco", iconURL: client.user.displayAvatarURL(), url: "https://www.youtube.com/watch?v=KWP8pQnGoBw"})
                .setFooter({text: "Serio já criei esse comando inumeras vezes"})
            await interaction.reply({embeds: [embed]});

        }
    }
}