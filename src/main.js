import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import dotenv from "dotenv";
import { DataTypes, Sequelize } from "sequelize";
import { Axios } from "axios";

let sequelize = new Sequelize({dialect: "sqlite", storage: "main.db"});

let Player = sequelize.define("Players", {
    ownerid: {
        type: DataTypes.STRING,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false
    },
    props: {
        type: DataTypes.JSON,
        allowNull: false
    },
    karma: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
}, {tableName: "Players"});

dotenv.config();

let client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});

client.on("ready", async () => {
console.log("Started");
   let data = [
        new SlashCommandBuilder()
        .setName("poke")
        .setDescription("Comandos de pokemon")
        .addSubcommand(sub => 
            sub
                
                .setName("create")
                .setDescription("Cria um novo personagem")
                .addStringOption(op => {
                    return op
                        .setName("sexo")
                        .setDescription("Você é menina ou menino ? (obs isso muda muito)")
                        .addChoices(
                            {
                                name: "Menino",
                                value: "boy"
                            },
                            {
                                name: "menina",
                                value: "girl"
                            }
                        )
                        .setRequired(true)
                })
                .addStringOption(op => {
                    return op
                        .setName("nome")
                        .setDescription("hmmm qual é seu nome ?")
                        .setRequired(true)
                })
        )
   ]

   let rest = new REST()
    .setToken(process.env.TOKEN);

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: data})
});

client.on("interactionCreate", async (interaction) => {
    if(interaction.isCommand() || interaction.isChatInputCommand()){
        if(interaction.commandName == "poke"){
            if(interaction.options.getSubcommand() === "create"){
                try {
                    let embed = new EmbedBuilder()
                    .setTitle("BEM-VINDO")
                    .setDescription("Já Já registraremos seu personagem espere...")
                    .addFields(
                        {
                            name: "Dica 1",
                            value: "Não há dicas disponiveis"
                        }
                    )
                    .setImage("https://media.tenor.com/JQkWX-lI-b0AAAAd/pokemon-pikachu.gif")
                    .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL(), url: "https://pokeapi.co"})
                    .setFooter({text: `By @${client.user.username}`, iconURL: client.user.displayAvatarURL()})
                    .setColor("Yellow")

                    let main = await interaction.reply({embeds: [embed]});
                    
                    embed = new EmbedBuilder();
                    setTimeout(async () => {
                        embed.setTitle("Primeiramente vamos escolher seu inicial, qual você prefere")
                            .setDescription("Isso não irá mudar para qual ginásio você dominará primeiramente...")
                            .setImage("https://static.guidestrats.com/images/02/13602/00-featured-choosing-starter-pokemon-in-professor-oak-lab-pokemon-frlg-screenshot.jpg")
                            .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL(), url: "https://pokeapi.co"})
                            .setFooter({text: `By @${client.user.username}`, iconURL: client.user.displayAvatarURL()})
                            .setColor("Purple")
                        
                            let button = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Você escolhe o charmander de fogo ?")
                                    .setStyle(ButtonStyle.Danger)
                                    .setEmoji("<:Charmander:1149917027109175317>")
                                    .setCustomId("charmander"),
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel("Você escolhe o bulbasaur de planta ?")
                                    .setEmoji("<:bulbasaur:1149917446132736000>")
                                    .setCustomId("bulbasaur"),
                                new ButtonBuilder()
                                    .setLabel("Ou o squirtle de agua ?")
                                    .setEmoji("<:squirtle:1149917430353776772>")
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId("squirtle")
                            )
                        await main.edit({embeds: [embed], components: [button]});
                        //let player = await Player.create({ownerid: interaction.user.id, name: interaction.options.getString("nome"), sex: interaction.options.getString("sexo"), props: {"xp": 0, "lv": 1, "yen": 100, poke: [], items: []}, karma: 0});
                        //await player.save();
                        let filter = i => i.user.id == interaction.user.id;
                        const collector = interaction.channel.createMessageComponentCollector({time: 15000, filter});
                        collector.on("collect", async (i) => {
                            if(i.user.id != interaction.user.id) return;
                            if(i.customId != "squirtle" && i.customId != "charmander" && i.customId != "bulbasaur") return;
                            await i.deferUpdate();      
                            let axios = new Axios({method: "get"});
                            let data = await axios.get(`https://pokeapi.co/api/v2/pokemon`);
                                                        
                            let player = await Player.create({ownerid: interaction.user.id, name: interaction.options.getString("nome"), sex: interaction.options.getString("sexo"), props: {"xp": 0, "lv": 1, "yen": 100, poke: [{"name": i.customId, type: [data.body.types]}], items: []}, karma: 0});
                            await player.save();
                        });
                    }, 5000);
                }catch(err){ 
                    console.log(err);
                    await interaction.reply("Houve um erro ao criar seu personagem tente novamente...");
                }
            }
        }
        
    }
});

(async () => {
    await Player.sync({force: true});
})();
client.login(process.env.TOKEN);