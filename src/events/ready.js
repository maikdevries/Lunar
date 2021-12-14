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
	try { await client.user.setUsername(process.env.DISCORD_USERNAME) }
	catch (error) { console.error(`[${Date()}] ERROR: ${error}`) }

	try { client.user.setActivity(process.env.DISCORD_ACTIVITY, { type: 'PLAYING' }) }
	catch (error) { console.error(`[${Date()}] ERROR: ${error}`) }

	try { await client.user.setAvatar('./avatar.png') }
	catch (error) { console.error(`[${Date()}] ERROR: ${error}`) }

	await database.setup(client);
	await commandHandler.setup(client);
	twitch.setup(client);
	youtube.setup(client);

	console.log(`${client.user.username} has loaded successfully and is now online!`);
}
