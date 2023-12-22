const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require("discord.js");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const tcg = require("@tcgdex/sdk").default;
let dex =  new tcg("pt");
dotenv.config();

let client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent]});

client.commands = new Collection();
let commands = [];

let commandFile = readdirSync(__dirname+"/commands/").filter(f => f.endsWith(".js"));

let cardData;
(async () => {
    cardData = await dex.fetch("cards");
})();

for(let file of commandFile){
    let command = require(__dirname+`/commands/${file}`);
    commands.push(command.data.toJSON());

    client.commands.set(command.data.name, command);
}

(async () => {
    if(commands.length){
        const rest = new REST().setToken(process.env.TOKEN);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands});
    }
})();

client.on(Events.ClientReady, () => {
    console.log(`Started bot ${client.user.tag}`);
    if(process.env.STATUS == "D"){
        client.user.setPresence({activities: [{name: "💻 | Em Ambiente desenvolvimento"}], status: "online"})
    }else if(process.env.STATUS == "P"){
        client.user.setPresence({activities: [{name: "Olá pessoas estou viva de novo e agora com novos comandos basta digitar / no chat para saber os meus comandos"}], status: "online"})
    }
}); 


client.on(Events.InteractionCreate, (interaction) => {
    if(!interaction.isCommand() || !interaction.isChatInputCommand()) return;

    let name = interaction.commandName;

    let command = client.commands.get(name);

    command.execute(interaction, client, cardData);
});

client.login(process.env.TOKEN);



