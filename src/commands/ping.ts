import { Command } from "../Types/CommandType";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Bot from "../ExtendedClient";
export const command: Command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("O comando mais importante do mundos dos bots"),
    execute({client, interaction}) {
        interaction.reply("PONG");
    },
}