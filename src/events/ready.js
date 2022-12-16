const { ActivityType } = require('discord.js');
const { readdir } = require('fs/promises');

const database = require('../database/setup.js');
const twitch = require('../features/twitch.js');
const youtube = require('../features/youtube.js');
const commandHandler = require('../features/commandHandler.js');

module.exports = {
	name: 'ready',
	once: true,
	execute
}

async function execute (client) {
	try {
		await client.user.setUsername(process.env.DISCORD_USERNAME);
		client.user.setPresence({ activities: [{ name: process.env.DISCORD_ACTIVITY, type: ActivityType.Playing }] });
		await client.user.setAvatar('./avatar.png');
	} catch (error) { console.error(`[${Date()}] ERROR: ${error}`) }

	await database.connectDatabase(client);
	await commandHandler.setup(client);

	const eventFiles = (await readdir('./src/events')).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		const event = require(`./${file}`);

		if (event.once) client.once(event.name, async (...args) => await event.execute(client, ...args));
		else client.on(event.name, async (...args) => await event.execute(client, ...args));
	}

	await database.synchronise(client);

	twitch.setup(client);
	youtube.setup(client);

	console.log(`${client.user.username} has loaded successfully and is now online!`);
}
