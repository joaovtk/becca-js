const { SlashCommandBuilder } = require("discord.js");
const { MongoClient } = require("mongodb");

let mongo = new MongoClient(process.env.MONGO_URL);
let db = mongo.db("pokecard");
let users = db.collection("users");
let assets = db.collection("assets");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pokecard")
        .setDescription("Pokemon tcg commands")
        .addSubcommand(sub => 
            sub
                .setName("daily")
                .setDescription("Diary daily card")
        ),

    async execute(interaction, client){
        if(interaction.options.getSubcommand() === "daily"){
            let data = assets.find();
            let card = data[Math.floor(Math.random() * data.length)];
            let user = users.findOne({id: interaction.user.id});
            if(!user){
                users.insertOne({id: interaction.user.id}) // make later
            }
        }
    }
}