const { SlashCommandBuilder, Embed, EmbedBuilder } = require("discord.js");
const { MongoClient } = require("mongodb");
const tcg = require("@tcgdex/sdk").default;
let dex =  new tcg("pt");
const { Parse } = require("../func")


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
        await interaction.deferReply();
        if(interaction.options.getSubcommand() === "daily"){
            
            let user = await users.findOne({id: interaction.user.id}); 
            if(!user){
                await users.insertOne({id: interaction.user.id, dexValue: 0, yen: 0, dex: [], xp: 0, lv: 0, daily: 0, cardsSeq: 0}); // make later
                user = await users.findOne({id: interaction.user.id});
            }
            let time = Parse(86400000 - (Date.now() - user.daily));
            if((time.seconds <= 0 && time.minutes <= 0 && time.hours <= 0 && time.days <= 0) || (user.daily == 0)){
                let len = await assets.countDocuments();
                let data = await dex.fetch("cards");
                let cards = data[Math.floor(Math.random() * data.length)];
                
                let i = 1;
                while(!cards.image){
                    await interaction.editReply(`Buscando cartas disponiveis ${i}`);
                    cards = data[Math.floor(Math.random() * data.length)];
                    i++;
                }

                let card = await dex.fetchCard(cards.id);
                let lastOp = Math.floor(Math.random() * 2)

                while((card.rarity != "Comum" && user.cardsSeq < 25) || (lastOp == 0) && (!cards.image)){
                    cards = data[Math.floor(Math.random() * data.length)];
                    card = await dex.fetchCard(cards.id);
                    await interaction.editReply(`Buscando cartas disponiveis ${i}`);
                }

                let embed = new EmbedBuilder();
    
                embed.setTitle("Daily diario chegou e a carta da vez é...")
                    .setDescription(`${card.name}, Com a raridade **${card.rarity}**`)
                    .setImage(card.image)
                
                switch(card.rarity){
                    case "Amazing":
                        embed.setColor("Aqua")
                            .setFooter({text:"Você extremamente sortudo"});
                        break;
                    case "Comum":
                        embed.setColor("Grey")
                            .setFooter({text: "Kri... Kri... Kri..."})
                        break;
                    case "Ilustração Rara":
                        embed.setColor("Orange")
                        .setFooter({text:"Nada a declara"})
                        break;
                    case "Ilustração Rara Especial":
                        embed.setColor("DarkOrange")
                            .setFooter({text: "Nada a declara"})
                        break;
                    case "Incomum":
                        embed.setColor("Green")
                            .setFooter({text:"Mais do mesmo mas é bom..."})
                        break;
                    case "Rara":
                        embed.setColor("Blue")
                        .setFooter({text:"Nada a declara"})
                        break;
                    case "Rara Dupla":
                        embed.setColor("Blurple")
                            .setFooter({text:"Nada a declara"})
                        break;
                    case "Rara Hiper":
                        embed.setColor("Purple")
                            .setFooter({text:"Nada a declara"})
                        break;
                    case "Rara Ultra":
                            embed.setColor("DarkPurple")
                            .setFooter({text:"Way Way..."})
                            break;
                    case "Secret Rare":
                        embed.setColor("Aqua")
                            .setFooter({text:"Isso é um segredo então deveria estar escondido"})
                        break
                }
                await interaction.editReply({content: "", embeds: [embed]});
                await users.updateOne({id: interaction.user.id}, {$set: {daily: Date.now()}, $push: {dex: data.id}, $inc: {cardsSeq: 1}});
            }else {
                let embed = new EmbedBuilder();
                embed.setTitle("Calma meu filho...")
                    .setDescription(`Você ainda tem ${time.hours == 0 ? "" : time.hours+" horas"} ${time.minutes == 0 ? "" : time.minutes+" minutos"} ${time.seconds == 0 ? "" : time.seconds+" segundos"} para resgatar outra carta gratis`)
                    .setColor("Red")
                await interaction.followUp({embeds: [embed]});
            }          
        }
    }
}