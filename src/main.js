import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from "discord.js";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";
import { createCanvas, createImageData, loadImage, Canvas } from "canvas";
import { createWriteStream } from "fs";

let ctx = canvas.getContext("2d");

dotenv.config();

let client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});
let sequelize = new Sequelize({storage: "main.db", dialect: "sqlite"});

let Users = sequelize.define("Users", {
    userid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gRupes: {
        type: DataTypes.NUMBER,
        allowNull: false
    },

    daily: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    
    sRupes: {
        type: DataTypes.JSON,
        allowNull: false
    },

    xp: {
        type: DataTypes.NUMBER,
        allowNull: false
    },

    lv: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    servers: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false
    },

    achivements: {
        type: DataTypes.ARRAY(DataTypes.JSON)
    },

    premium: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },

    vote: {
        type: DataTypes.NUMBER
    
    }
});

let TdPlayers = sequelize.define("TdPlayers", {
    userid: {
        type: DataTypes.STRING,
        allowNull: false
    },

    towers: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false
    },

    karma: {
        type: DataTypes.NUMBER,
        allowNull: false
    },

    rubys: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
});

client.on("ready", async () => {
console.log("Started");
   let data = [
    new SlashCommandBuilder()
        .setName("td")
        .setDescription("Comandos de defesa de torre")
        .addSubcommand(sub =>
            sub
                .setName("batalhar")
                .setDescription("Comeca uma partida de tower defense contra bots ou jogadores")
                .addBooleanOption(op => {
                    return op
                        .setName("multijogador")
                        .setDescription("Vai jogar contra bots ou ia ?")
                        .setRequired(true)
                })
        )
        .addSubcommand(sub => 
            sub
                .setName("loja")
                .setDescription("Permite que você compre cartas")
        )
   ];

   let rest = new REST()
    .setToken(process.env.TOKEN);

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: data})
});

client.on("interactionCreate", async (interaction) => {
    if(interaction.isCommand() || interaction.isChatInputCommand() || interaction.isButton()){
        if(interaction.commandName == "td"){
            if(interaction.options.getSubcommand() === "batalhar"){
                if(!interaction.options.getBoolean("multijogador")){
                    await ctx.drawImage(image, 0, 0)
                    let avatar = await loadImage(interaction.user.displayAvatarURL({size: 256, extension: "jpeg"}));
                    
                    await interaction.reply({files: [attachment]});
                }else {
                    await interaction.reply("Modo indisponivel");
                }
            }
        }
    }
});

client.login(process.env.TOKEN);