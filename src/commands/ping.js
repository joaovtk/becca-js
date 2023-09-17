const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Comando universal do comando"),
    async execute(interaction, client){
        await interaction.reply("PONG");
    }
}