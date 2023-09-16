import Bot from "./ExtendedClient";
import { GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env.CLIENT_ID!);
let bot: Bot = new Bot([GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages], process.env.TOKEN!, process.env.GUILD_ID!, process.env.CLIENT_ID!);

bot.on("ready", () => {
    console.log("STARTED");
});

bot.on("interactionCreate", (interaction) => {
    if(interaction.isCommand() || interaction.isChatInputCommand()){
        let name = interaction.commandName!
        let command = bot.collect.get(name);

        if(command){
            command.execute({interaction, client: bot});
        }
        
    }
});

bot.start();