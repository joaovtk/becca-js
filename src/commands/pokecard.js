const { SlashCommandBuilder, Embed, EmbedBuilder, ComponentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { MongoClient } = require("mongodb");
const tcg = require("@tcgdex/sdk").default;

const { Parse } = require("../func")


let mongo = new MongoClient(process.env.MONGO_URL);
let db = mongo.db("pokecard");
let users = db.collection("users");
let dex =  new tcg("pt");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pokecard")
        .setDescription("Pokemon tcg commands")
        .addSubcommand(sub => 
            sub
                .setName("daily")
                .setDescription("Diary daily card")
        )
        .addSubcommandGroup(group => 
            group.setName("cards")
                .setDescription("Card commands from tcg commands")
            .addSubcommand(sub => 
                sub
                    .setName("list")
                    .setDescription("List cards from tcg commands")
                    .addUserOption(op => {
                        return op
                            .setName("user")
                            .setDescription("User from get the deck")
                    })
            )    
        ),
    async execute(interaction, client, cardData){
        await interaction.deferReply();
        if(interaction.options.getSubcommand() === "daily"){
            let user = await users.findOne({id: interaction.user.id}); 
            if(!user){
                await users.insertOne({id: interaction.user.id, yen: 0, dex: [], xp: 0, lv: 0, daily: 0}); // make later
                user = await users.findOne({id: interaction.user.id});
            }
            let time = Parse(86400000 - (Date.now() - user.daily));
            if((time.seconds <= 0 && time.minutes <= 0 && time.hours <= 0 && time.days <= 0) || (user.daily == 0)){
                let cards = cardData[Math.floor(Math.random() * cardData.length)];
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


                let soma = rarities.reduce((total, item) => total + item.value, 0);

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

                while((card.rarity != cardRare) && (typeof(card.image) != "undefined") && (card.rarity == "None")){
                    card = await dex.fetchCard(cards.id);
                }

                let imageUrl = card.image + "/high.png";

                let embed = new EmbedBuilder();
                let yen = Math.floor(Math.random() * 100);
                embed.setTitle("Daily diario chegou e a carta da vez é...")
                    .setDescription(`${card.name}, Com a raridade **${card.rarity}** + ${yen} yen`)
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
                await users.updateOne({id: interaction.user.id}, {$set: {daily: Date.now()}, $push: {dex: card.id}, $inc: {yen: yen}});
            }else {
                let embed = new EmbedBuilder();
                embed.setTitle("Calma meu filho...")
                    .setDescription(`Você ainda tem ${time.hours == 0 ? "" : time.hours+" horas"} ${time.minutes == 0 ? "" : time.minutes+" minutos"} ${time.seconds == 0 ? "" : time.seconds+" segundos"} para resgatar outra carta gratis`)
                    .setColor("Red")
                await interaction.followUp({embeds: [embed]});
            }          
        }else if(interaction.options.getSubcommandGroup() === "cards"){
            if(interaction.options.getSubcommand() === "list"){
                let user = interaction.options.getUser("user") || interaction.user;

                let userData = await users.findOne({id: user.id});
                if(!userData){
                    await users.insertOne({id: interaction.user.id, yen: 0, dex: [], xp: 0, lv: 0, daily: 0}); // make later
                    let userData = await users.findOne({id: user.id});
                    await interaction.followUp("**Você não tem nenhuma carta na conta**")
                }else {
                    let embeds = [];
                    let cards = [];
                    for(let c of userData.dex){
                        let data = await dex.fetchCard(c);
                        
                        cards.push({name: data.name, rarity: data.rarity, image: data.image});
                    }
                    cards.map(m => {
                        embeds.push(
                            new EmbedBuilder()
                                .setTitle(`Deck do ${user.tag}`)
                                .addFields({
                                    name: `${m.name}`,
                                    value: `${m.rarity}`
                                })
                                .setImage(`${m.image}/high.png`)    
                        )
                    });
                    let test = new EmbedBuilder();

                    for(let embed of embeds){
                        
                        switch(cards[embeds.indexOf(embed)].rarity){
                            case "Amazing":
                                embeds[embeds.indexOf(embed)].setColor("Aqua")
                                    .setFooter({text:"Você extremamente sortudo"});
                                break;
                            case "Comum":
                                embeds[embeds.indexOf(embed)].setColor("Grey")
                                    .setFooter({text: "Kri... Kri... Kri..."})
                                break;
                            case "Ilustração Rara":
                                embeds[embeds.indexOf(embed)].setColor("Orange")
                                .setFooter({text:"Nada a declara"})
                                break;
                            case "Ilustração Rara Especial":
                                embeds[embeds.indexOf(embed)].setColor("DarkOrange")
                                    .setFooter({text: "Nada a declara"})
                                break;
                            case "Incomum":
                                embeds[embeds.indexOf(embed)].setColor("Green")
                                    .setFooter({text:"Mais do mesmo mas é bom..."})
                                break;
                            case "Rara":
                                embeds[embeds.indexOf(embed)].setColor("Blue")
                                .setFooter({text:"Nada a declara"})
                                break;
                            case "Rara Dupla":
                                embeds[embeds.indexOf(embed)].setColor("Blurple")
                                    .setFooter({text:"Nada a declara"})
                                break;
                            case "Rara Hiper":
                                embeds[embeds.indexOf(embed)].setColor("Purple")
                                    .setFooter({text:"Nada a declara"})
                                break;
                            case "Rara Ultra":
                                embeds[embeds.indexOf(embed)].setColor("DarkPurple")
                                .setFooter({text:"Way Way..."})
                                break;
                            case "Secret Rare":
                                embeds[embeds.indexOf(embed)].setColor("Aqua")
                                    .setFooter({text:"Isso é um segredo então deveria estar escondido"})
                                break
                        }
                    }

                    let component = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Anterior")
                            .setCustomId("prev")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("⏮")
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setLabel("Proximo")
                            .setCustomId("next")
                            .setEmoji("⏭")
                            .setStyle(ButtonStyle.Primary)
                    );

                    if(embeds.length == 1){
                        component.components[0].setDisabled(true);
                        component.components[1].setDisabled(true);
                    }

                    let i = 0
                    await interaction.followUp({embeds: [embeds[i]], components: [component]});
                    
                    let filter = i => !i.user.bot;

                    let collector = await interaction.channel.createMessageComponentCollector({filter, timeout: 60000});
                    
                    collector.on("collect", async (int) => {
                        if(int.customId == "prev"){
                            if(i <= 0){
                                component.components[0].setDisabled(true);
                            }else {
                                i--;
                                if(i <= 0){
                                    component.components[0].setDisabled(true);
                                }else {
                                    component.components[0].setDisabled(false); 
                                }

                                if(embeds.length > 1){
                                    component.components[1].setDisabled(false);
                                }
                            }
                        }else if(int.customId == "next"){
                            if(i >= embeds.length - 1){
                                component.components[1].setDisabled(true);
                            }else {
                                i++;
                                if(i >= embeds.length - 1){
                                    component.components[1].setDisabled(true);
                                }else {
                                    component.components[1].setDisabled(false); 
                                }

                                if(embeds.length > 1){
                                    component.components[0].setDisabled(false);
                                }
                            }
                        }
                        int.deferUpdate();
                        await interaction.editReply({embeds: [embeds[i]], components: [component]});;
                    });
                }
            }
        }
    }
}