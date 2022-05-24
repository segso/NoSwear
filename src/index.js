const fs = require('fs');
const language = require('../language.json');
let file = fs.readFileSync("./insults.txt", "utf-8").split('\n').filter(el => el);

require('dotenv').config();

const {Client, Intents} = require("discord.js");
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const timeout = 30000;

const createMuteEmbed = require("./embed.js");
const embed = createMuteEmbed(language, process.env.USER_NICK, 0, timeout);
const unmuteEmbed = createMuteEmbed(language, process.env.USER_NICK, 1);

client.on("ready", () => {
    console.log("The bot is ready");
});

client.on('messageCreate', async (message) => {
    if (message.author.id != process.env.USER_ID) {
        return;
    }

    let content = message.content.toLowerCase();

    let accents = ['á', 'é', 'í', 'ó', 'ú'];
    let vocals = ['a', 'e', 'i', 'o', 'u'];


    for (let index in accents) {
        if (content.indexOf(accents[index]) != -1) {
            content = content.replaceAll(accents[index], vocals[index]);
        }
    }

    const channel = message.channel;

    if (content.startsWith(language.commands.add_insult)) {
        let arr = content.split(/\s+/);
        if (arr[1]) {
            file.push(arr[1]);
            channel.send(language.insult_added);
            fs.writeFileSync("insults.txt", file.join("\n"));
            return;
        }
        channel.send(language.add_insult_missing_args);
        return;
    }
    
    if (content.startsWith(language.commands.remove_insult)) {
        let arr = content.split(/\s+/);
        if (!arr[1]) {
            channel.send(language.remove_insult_missing_args);
            return;
        }
        let insult = arr[1];
        if (file.indexOf(insult) == -1) {
            channel.send(language.insult_not_found);
            return;
        }
        file = file.filter(el => el !== insult);
        channel.send(language.insult_removed);
        fs.writeFileSync("insults.txt", file.join("\n"));
        return;
    }

    for (let index in file) {
        let insult = file[index];
        if (content.indexOf(insult) != -1) {
            const member = message.member;
            if (!member) {
                return;
            }
            const role = message.guild.roles.cache.find(r => r.id === process.env.ROLE_ID);

            await message.delete();
            await member.roles.remove(role);
            member.timeout(timeout);
            message.channel.send({ embeds: [embed] });

            setTimeout(() => {
                member.roles.add(role);
                message.channel.send({ embeds: [unmuteEmbed] });
            }, timeout);
            return;
        }
    }
});

client.login(process.env.TOKEN);
