const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require("discord.js");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const { mongoose } = require("./model");
let client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent]});

client.commands = new Collection();
let commands = [];

let commandFile = readdirSync(__dirname+"/commands/").filter(f => f.endsWith(".js"));


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
});

client.on("interactionCreate", (interaction) => {
    if(!interaction.isCommand() || !interaction.isChatInputCommand()) return;

    let name = interaction.commandName;

    let command = client.commands.get(name);

    command.execute(interaction, client);
});

(async () => {
    await mongoose.connect(process.env.MONGO_URL, {dbName: "MAIN"});
})();

client.login(process.env.TOKEN);



