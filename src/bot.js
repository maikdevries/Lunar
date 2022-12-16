require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const readyEvent = require('./events/ready.js');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent],
	partials: [Partials.Message, Partials.Reaction]
});

client.once('ready', (client) => readyEvent.execute(client));

client.on('warn', (warning) => console.warn(`[${Date()}] WARNING: ${warning}`));
client.on('error', (error) => console.error(`[${Date()}] ERROR: ${error}`));

client.login(process.env.DISCORD_TOKEN);

process.on('unhandledRejection', (error) => console.error(`[${Date()}] ERROR: ${error}`));
process.on('uncaughtException', (error) => console.error(`[${Date()}] ERROR: ${error}`));
