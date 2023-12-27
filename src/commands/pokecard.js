const {  SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pokecarta")
        .setDescription("Comandos de pokemon da ms Pikachu")
        .setNameLocalization("en-US", "pokecard")
        .setDescriptionLocalization("en-US", "Pokemon command from ms Pikachu")
        .addSubcommand(sub => 
            sub
                .setName("resgatar")    
                .setDescription("Te dá uma carta aleatoria, totalmente de graça")
                .setNameLocalization("en-US", "daily")
                .setDescriptionLocalization("en-US", "Gift random card free")
        ),
    async execute(interaction, client){
        if(interaction.options.getSubcommand()){
            let cardGift = {};
            // set up embeds
            function GetEmbeds(cardGift, time){
                let dailyEmbed = new EmbedBuilder();
                let timeoutEmbed = new EmbedBuilder();
                if(time.hours <= 0 && time.minutes <= 0 && time.seconds <= 0){
                    if(interaction.locale == "en-US"){
                        dailyEmbed.setTitle(`Your card is ${cardGift.name}`)
                    }else {
                        dailyEmbed.setTitle(`Sua carta é ${cardGift.name}`)
                            .setDescription(`Parbéns você ganhou uma carta com a raridade ${cardGift}`)
                    }
                    dailyEmbed.setImage(cardGift.image)
                    return {embed:dailyEmbed, status: "success"};
                }else {
                    if(interaction.locale == "en-US"){
                        dailyEmbed.setTitle(`Wait!!! bro you have ${time.hours == 0 ? "" : time.hours+" hours"} ${time.minutes == 0 ? "" : time.minutes+" minutes"} and ${time.seconds == 0 ? "" : time.seconds+" seconds"} top get a new card`)
                            .setColor("Red")
                    }else {
                        dailyEmbed.setTitle(`Pera pera ai!!!!, você tem ainda ${time.hours == 0 ? "" : time.hours+" horas"} ${time.minutes == 0 ? "" : time.minutes+" minutos"} e ${time.seconds == 0 ? "" : time.seconds+" segundos"}`)
                            .setColor("Red")
                    }
                    return {embed: timeoutEmbed, status: "timeout"};
                }
            }
        }
    }
}