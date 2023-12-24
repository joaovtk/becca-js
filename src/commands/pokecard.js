const { SlashCommandBuilder, Embed, EmbedBuilder, ComponentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, time } = require("discord.js");
const { MongoClient } = require("mongodb");
const axios = require("axios").default;

const { Parse } = require("../func")
let timeout = new Collection();

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
        )
        .addSubcommandGroup(group => 
            group.setName("inventory")
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
            .addSubcommand(sub => 
                sub
                    .setName("packet")
                    .setDescription("Buy package")
            )
        )
        .addSubcommand(sub => 
            sub
            .setName("card")
            .setDescription("Card search")
            .addStringOption(op => {
                return op
                    .setName("query")
                    .setDescription("Card name")
            })    
        ),
    isPrivate: true,
    async execute(interaction, client){
        try {
            if(interaction.defered){
                await interaction.reply("Você já executou um comado expere por favor");
            }else {
                await interaction.deferReply();
                if(interaction.options.getSubcommand() === "daily"){
                    if(timeout.has(interaction.user.id)){
                        await interaction.followUp("Opa perai, você já tem um comando rodando clique em fechar comando ou espere ele acabar");
                    }else{
                        let user = await users.findOne({id: interaction.user.id}); 
                        if(!user){
                            await users.insertOne({id: interaction.user.id, yen: 0, dex: [], xp: 0, lv: 0, daily: 0}); // make later
                            user = await users.findOne({id: interaction.user.id});
                        }
                        let time = Parse(86400000 - (Date.now() - user.daily));
                        if((time.seconds <= 0 && time.minutes <= 0 && time.hours <= 0 && time.days <= 0) || (user.daily == 0)){
                            let res = await axios.get(`https://api.tcgdex.net/v2/pt/cards`);
                            let cards = res.data;
                            cards = cards[Math.floor(Math.random() * cards.length)];
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
            
                            res = await axios.get(`https://api.tcgdex.net/v2/pt/cards/${cards.id}`);
            
                            let card = res.data;
            
                            while((card.rarity != cardRare) && (!card.image) && (card.rarity == "None")){
                                res = await axios.get(`https://api.tcgdex.net/v2/pt/cards/${cards.id}`);
                
                                card = res.data;
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
                    }
                }else if(interaction.options.getSubcommandGroup() === "inventory"){
                    if(interaction.options.getSubcommand() === "list"){
                        if(timeout.has(interaction.user.id)){
                            await interaction.followUp("Opa perai, você já tem um comando rodando clique em fechar comando ou espere ele acabar");
                        }else{
                            timeout.set(interaction.user.id, "pokecard");
                            let user = interaction.options.getUser("user") || interaction.user;
        
                            let userData = await users.findOne({id: user.id});
                            if(!userData){
                                await users.insertOne({id: interaction.user.id, yen: 0, dex: [], xp: 0, lv: 0, daily: 0}); // make later
                                let userData = await users.findOne({id: user.id});
                                await interaction.followUp("**Você não tem nenhuma carta na conta**")
                            }else {
                                let embeds = [];
                                let cards = [];
                                let i = 0
                                for(let c of userData.dex){
                                    let res = await axios.get(`https://api.tcgdex.net/v2/pt/cards/${c}`);
                                    let data = res.data
                                    
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
                                        .setCustomId("any")
                                        .setLabel(`${i + 1}/${embeds.length}`)
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setLabel("Proximo")
                                        .setCustomId("next")
                                        .setEmoji("⏭")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId("close")
                                        .setLabel("Fechar comando")
                                        .setEmoji("❌")
                                        .setStyle(ButtonStyle.Danger)
                                );
            
                                if(embeds.length == 1){
                                    component.components[0].setDisabled(true);
                                    component.components[1].setDisabled(true);
                                }
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
                                        await component.components[1].setLabel(`${i + 1}/${embeds.length}`);
                                        await interaction.editReply({embeds: [embeds[i]], components: [component]});
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
                                        await component.components[1].setLabel(`${i + 1}/${embeds.length}`);
                                        await interaction.editReply({embeds: [embeds[i]], components: [component]});
                                    }else if(int.customId == "close"){
                                        collector.stop();
                                    }
                                    int.deferUpdate();
                                });
                                
                                collector.on("end", async (collected, reason) => {
                                    component.components.splice(3, 1);
                                    component.components.map(co => {
                                        co.setDisabled(true);
                                    });
                                    await interaction.editReply({embeds: [embeds[i]], components: [component]});
                                    timeout.delete(interaction.user.id);
                                });
                            } 
                        }
                    }else if(interaction.options.getSubcommand() === "packet"){
                    
                    }
                }else if(interaction.options.getSubcommand() === "card"){
                    
                    let query = interaction.options.getString("query");
                    if(!query){
                        if(timeout.has(interaction.user.id)){
                            await interaction.followUp("Opa perai, você já tem um comando rodando clique em fechar comando ou espere ele acabar");
                        }else{
                            timeout.set(interaction.user.id, "pokecard");
                            let res = await axios.get(`https://api.tcgdex.net/v2/pt/cards/`);
                            let cards = res.data;
                            let embeds = [];
                            let i = 0;
                            cards.map(card => {
                                if(card.image && card.name && card.id){
                                    embeds.push(
                                        new EmbedBuilder()
                                            .setTitle(`${card.name}`)
                                            .setImage(`${card.image}/high.png`)
                                            .setColor("Green")
                                    );
                                }
                            });
            
                            let components = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel("Anterior")
                                    .setCustomId("prev")
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji("⏮")
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId("any")
                                    .setLabel(`${i + 1}/${embeds.length}`)
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setLabel("Proximo")
                                    .setCustomId("next")
                                    .setEmoji("⏭")
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId("close")
                                    .setLabel("Fechar comando")
                                    .setEmoji("❌")
                                    .setStyle(ButtonStyle.Danger)
                            );
            
                            await interaction.followUp({embeds: [embeds[i]], components: [components]});
                            let filter = i => !i.user.bot && i.user.id == interaction.user.id;
            
                            let collector = await interaction.channel.createMessageComponentCollector({filter, timeout: 60000});
                            collector.on("collect", async (int) => {
                                if(int.customId == "prev"){
                                    if(i <= 0){
                                        components.components[0].setDisabled(true);
                                    }else {
                                        i--;
                                        if(i <= 0){
                                            components.components[0].setDisabled(true);
                                        }else {
                                            components.components[0].setDisabled(false); 
                                        }
            
                                        if(embeds.length > 1){
                                            components.components[2].setDisabled(false);
                                        }
                                    }
                                    await components.components[1].setLabel(`${i + 1}/${embeds.length}`);
                                    await interaction.editReply({embeds: [embeds[i]], components: [components]});
                                }else if(int.customId == "next"){
                                    if(i >= embeds.length - 1){
                                        components.components[1].setDisabled(true);
                                    }else {
                                        i++;
                                        if(i >= embeds.length - 1){
                                            components.components[2].setDisabled(true);
                                        }else {
                                            components.components[2].setDisabled(false); 
                                        }
            
                                        if(embeds.length > 1){
                                            components.components[0].setDisabled(false);
                                        }
                                    }
                                    await components.components[1].setLabel(`${i + 1}/${embeds.length}`);
                                    await interaction.editReply({embeds: [embeds[i]], components: [components]});
                                }else if(int.customId == "close"){
                                    collector.stop();
                                }
                                int.deferUpdate();
                            });

                            collector.on("end", async (collected, reason) => {
                                components.components.splice(3, 1);
                                components.components.map(co => {
                                    co.setDisabled(true);
                                });
                                await interaction.editReply({embeds: [embeds[i]], components: [components]});
                                timeout.delete(interaction.user.id);
                            });
                        }
                    }else {
                        let res = await axios.get(`https://api.tcgdex.net/v2/pt/cards/${query}`);
                        let card = res.data;
                        if(!card && card.image){
                            await interaction.followUp("Carta invalida, use o comando /pokecard card sem paramentros para pegar o nome da carta");
                        }else {
                            console.log(card);
                            let embed = new EmbedBuilder()
                                .setTitle(`${card.name}`)
                                .addFields(
                                    {
                                        name: `Raridade`,
                                        value: `${card.rarity}`
                                    },
                                    {
                                        name: `Tipos`,
                                        value: `${card.types.toString()}`
                                    }
                                )
                                .setImage(`${card.image}/high.png`)
        
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
                            await interaction.followUp({embeds: [embed]});
                        }
                    }
                }
            }
            
        }catch(err){
            await interaction.reply("Houve um erro ao executar o comand");
        }
    }
}