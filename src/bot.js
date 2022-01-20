require('dotenv').config();

const { Client, Intents } = require('discord.js');
const readyEvent = require('./events/ready.js');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'REACTION']
});

client.once('ready', (client) => readyEvent.execute(client));

client.on('warn', (warning) => console.warn(`[${Date()}] WARNING: ${warning}`));
client.on('error', (error) => console.error(`[${Date()}] ERROR: ${error}`));

client.login(process.env.DISCORD_TOKEN);

process.on('unhandledRejection', (error) => console.error(`[${Date()}] ERROR: ${error}`));
process.on('uncaughtException', (error) => console.error(`[${Date()}] ERROR: ${error}`));
