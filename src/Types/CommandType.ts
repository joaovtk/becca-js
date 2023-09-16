import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Bot from "../ExtendedClient";

interface options {
    interaction: CommandInteraction;
    client: Bot;
}

type Execute = (options: options) => void;

export type Command = {
    data: SlashCommandBuilder
    execute: Execute;
}

