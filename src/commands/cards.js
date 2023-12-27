const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { MongoClient } = require("mongodb");
const axios = require("axios").default;

let mongo = new MongoClient(process.env.MONGO_URL);
let db = mongo.db("pokecard");
let users = db.collection("users");
let packet = db.collection("packet");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cards")
        .setDescription("cards")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName("changeuser")
                .setDescription("Change props in pokercard database")
                .addStringOption(op => {
                    return op
                        .setName("props")
                        .setDescription("Props database")
                        .addChoices(
                            {
                                name: "dex",
                                value: "dex"
                            },
                            {
                                name: "xp",
                                value: "xp"
                            },
                            {
                                name: "lv",
                                value: "lv"
                            },
                            {
                                name: "daily",
                                value: "daily"
                            },
                            {
                                name: "yen",
                                value: "yen"
                            }
                        )
                        .setRequired(true)
                })
                .addUserOption(op => {
                    return op
                        .setName("user")
                        .setDescription("User to change")
                        .setRequired(true)
                })

                .addStringOption(op => {
                    return op
                        .setName("value")
                        .setDescription("Value query")
                        .setRequired(true)
                })
        ),
        isPrivate: true,

        async execute(interaction, client, cardData){
            await interaction.deferReply();
            if(interaction.options.getSubcommand() === "changeuser"){
                let mention = interaction.options.getUser("user");
                let field = await interaction.options.getString("props");
                let value = await interaction.options.getString("value");
                let user = await users.findOne({id: mention.id}); 

                if(!user){
                    await users.insertOne({id: interaction.user.id, yen: 0, dex: [], xp: 0, lv: 0, daily: 0}); // make later
                    user = users.findOne({id: mention.id});
                }

                console.log(field);

                switch(field){
                    case "dex":
                        let card = await dex.fetchCard(value);

                        if(!card){
                            await interaction.followUp("Carta invalida");
                        }else {
                            await users.updateOne({id: mention.id}, {$push: {dex: value}});
                            await interaction.followUp("Carta adicionada ao perfil");
                        }
                        break;
                    case "xp":
                        await users.updateOne({id: mention.id}, {$set: {xp: value}});
                        await interaction.followUp(`XP setado com sucesso para o valor ${value}`);
                        break;
                    case "lv":
                        await users.updateOne({id: mention.id}, {$set: {xp: value}});
                        await interaction.followUp(`Level setado com sucesso para o valor ${value}`);
                        break;
                    case "yen":
                        await users.updateOne({id: mention.id}, {$set: {yen: value}});
                        await interaction.followUp(`Yen setado com sucesso para o valor ${value}`);
                        break;
                    case "daily":
                        await users.updateOne({id: mention.id}, {$set: {daily: value}});
                        await interaction.followUp(`Daily setado com sucesso para o valor ${value}`);
                        break;
                }
            }
        }
}