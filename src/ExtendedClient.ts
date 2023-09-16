import { Client, Collection, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

import { Command } from "./Types/CommandType";
import { readdirSync } from "fs";

class Bot extends Client {
    public collect: Collection<string, Command> = new Collection();  
    private deployArray: object[] = [];
    public guildId: string;
    public clientId: string;
    constructor(intents: GatewayIntentBits[], token: string, guildId: string, clientId: string){
        super({intents: intents});
        this.token = token;
        this.guildId = guildId;
        this.clientId = clientId;
    }

    async deploy(){
        let commandFile = readdirSync(__dirname+"/commands").filter(f => f.endsWith(".js") || f.endsWith(".ts"));
        for(let file of commandFile){            
            let command = (await import(__dirname+`/commands/${file}`));
            this.deployArray.push(command.command.data.toJSON());

            this.collect.set(command.command.data.name, command.command);
            if(this.deployArray){
                const rest = new REST().setToken(this.token!);
                await rest.put(Routes.applicationGuildCommands(this.clientId!, this.guildId), {body: this.deployArray});
            }
        }
    }

    start(){
        this.deploy();
        this.login(this.token!);
    }
}

export default Bot;