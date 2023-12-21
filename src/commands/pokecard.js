const { SlashCommandBuilder, Embed, EmbedBuilder } = require("discord.js");
const { MongoClient } = require("mongodb");

const { Parse } = require("../func")


let mongo = new MongoClient(process.env.MONGO_URL);
let db = mongo.db("pokecard");
let users = db.collection("users");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pokecard")
        .setDescription("Pokemon tcg commands")
        .addSubcommand(sub => 
            sub
                .setName("daily")
                .setDescription("Diary daily card")
        ),

    async execute(interaction, client, cardData){
        await interaction.deferReply();
        if(interaction.options.getSubcommand() === "daily"){
            let user = await users.findOne({id: interaction.user.id}); 
            if(!user){
                await users.insertOne({id: interaction.user.id, dexValue: 0, yen: 0, dex: [], xp: 0, lv: 0, daily: 0}); // make later
                user = await users.findOne({id: interaction.user.id});
            }
            let time = Parse(86400000 - (Date.now() - user.daily));
            if((time.seconds <= 0 && time.minutes <= 0 && time.hours <= 0 && time.days <= 0) || (user.daily == 0)){
                let cards = cardData[Math.floor(Math.random() * data.length)];
                let rarities = [
                    {name: "Amazing", value: 0.00025},
                    {name: "Comum", value: 8},
                    {name: "Ilustração Rara", value: 0.5},
                    {name: "Ilustração Rara Especial", value: 0.2},
                    {name: "Incomum", value: 5},
                    {name: "Rara", value: 3},
                    {name: "Rara Dupla", value: 2},
                    {name: "Rara Hiper", value: 1},
                    {name: "Rara Ultra", value: 0.1},
                    {name: "Secret Rare", value: 0.0050},
                ];


                let soma = rarities.reduce((total, item) => total + item.valuem, 0);

                let random = Math.random() * soma;

                let parcial = 0;
                let cardRare = "";

                for(const rar of rarities){
                    parcial += rar.value;
                    if(random < parcial){
                        cardRare = rar.name;
                    }
                }

                let card = await dex.fetchCard(cards.id);

                while(!card.rarity != cardRare && !card.image && card.rarity == "None"){
                    card = await dex.fetchCard(cards.id);
                }


                let imageUrl = card.image + "/high.png";

                let embed = new EmbedBuilder();
    
                embed.setTitle("Daily diario chegou e a carta da vez é...")
                    .setDescription(`${card.name}, Com a raridade **${card.rarity}**`)
                    .setImage(imageUrl)
                
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
                await users.updateOne({id: interaction.user.id}, {$set: {daily: Date.now()}, $push: {dex: card.id}, $inc: {cardsSeq: 1}});
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