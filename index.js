// @bong
// Nautilus "index.js"

const {
    Client,
    GatewayIntentBits,
    ActivityType
} = require("discord.js");
const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const {
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    TextChannel,
} = require("discord.js");


const config = require("./config.json");
require('dotenv').config()

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});
client.config = config

client.on("interactionCreate", async(interaction) => {
    if (!interaction.isCommand()) return;

    const command = require(`./commands/${interaction.commandName}`);

    if (command) {
        command.exec(client, interaction);
    }
});

client.once('ready', () => {
    console.log('Ready!');

    client.user.setPresence({
        activities: [{
            name: '/help',
            type: ActivityType.Watching
        }],
        status: 'watching'
    })
});

const {
    REST
} = require("@discordjs/rest");
const {
    Routes
} = require("discord-api-types/v9");
const fs = require("fs");

const commands = [];
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
let global = [];

const clientId = '1074307001045233698';
const clientToken = process.env.TOKEN
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (!command.disabled) {
        if (command.global && command.global == true) {
            global.push(command.data.toJSON());
        } else {
            console.log(command);
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({
    version: "10"
}).setToken(clientToken);
(async() => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.log(error);
    }
})();

client.login(clientToken);