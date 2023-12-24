const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require("discord.js");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const tcg = require("@tcgdex/sdk").default;
let dex =  new tcg("pt");
dotenv.config();

let client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent]});

client.commands = new Collection();
client.private = new Collection();
let commands = [];
let private = [];


let commandFile = readdirSync(__dirname+"/commands/").filter(f => f.endsWith(".js"));

let cardData;
(async () => {
    cardData = await dex.fetch("cards");
})();

for(let file of commandFile){
    let command = require(__dirname+`/commands/${file}`);

    if(command.isPrivate){
        client.private.set(command.data.name, command);
        private.push(command.data.toJSON());
    }else{
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}

(async () => {
    const rest = new REST().setToken(process.env.TOKEN);
    if(commands.length > 0){
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: commands});
    }

    if(private.length > 0){
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: private});
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
    console.log("Test");
    if(interaction.isCommand() || interaction.isChatInputCommand() || interaction.isModalSubmit()){   
        let name = interaction.commandName;

        console.log(name);

        let command = client.commands.get(name) || client.private.get(name);

        command.execute(interaction, client, cardData);
    }
});

client.login(process.env.TOKEN);



