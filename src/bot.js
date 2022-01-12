require('dotenv').config();

const { Client, Intents } = require('discord.js');
const { readdir } = require('fs/promises');

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'REACTION']
});

(async () => {
	const eventFiles = (await readdir('./src/events')).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		const event = require(`./events/${file}`);

		if (event.once) client.once(event.name, async (...args) => await event.execute(client, ...args));
		else client.on(event.name, async (...args) => await event.execute(client, ...args));
	}
})();

client.on('warn', (warning) => console.warn(`[${Date()}] WARNING: ${warning}`));
client.on('error', (error) => console.error(`[${Date()}] ERROR: ${error}`));

client.login(process.env.DISCORD_TOKEN);

process.on('unhandledRejection', (error) => console.error(`[${Date()}] ERROR: ${error}`));
process.on('uncaughtException', (error) => console.error(`[${Date()}] ERROR: ${error}`));
