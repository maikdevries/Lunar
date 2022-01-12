const Josh = require('@joshdb/core');
const provider = require('@joshdb/mongo');

const defaultSettings = require('./defaultSettings.json');

module.exports = {
	description: 'Establishes a connection to the required databases instances and prepares them for operation',
	setup
}

async function setup (client) {
	connectDatabase(client);
	await syncGuilds(client);
	await syncSettings(client);
}

function connectDatabase (client) {
	client.settings = new Josh({
		name: 'settings',
		provider,
		providerOptions: {
			collection: 'settings',
			dbName: process.env.DATABASE_NAME,
			url: `mongodb+srv://${process.env.DATABASE_URL + process.env.DATABASE_NAME}?retryWrites=true&w=majority`
		}
	});

	client.twitch = new Josh({
		name: 'twitch',
		provider,
		providerOptions: {
			collection: 'twitch',
			dbName: process.env.DATABASE_NAME,
			url: `mongodb+srv://${process.env.DATABASE_URL + process.env.DATABASE_NAME}?retryWrites=true&w=majority`
		}
	});

	client.youtube = new Josh({
		name: 'youtube',
		provider,
		providerOptions: {
			collection: 'youtube',
			dbName: process.env.DATABASE_NAME,
			url: `mongodb+srv://${process.env.DATABASE_URL + process.env.DATABASE_NAME}?retryWrites=true&w=majority`
		}
	});
}

async function syncGuilds (client) {
	const allGuilds = await client.settings.keys;

	allGuilds.filter((guildID) => !client.guilds.cache.has(guildID)).forEach((guildID) => client.emit('guildDelete', { id: guildID }));
	client.guilds.cache.filter((guild) => !allGuilds.includes(guild.id)).forEach((guild) => client.emit('guildCreate', guild));
}

async function syncSettings (client) {
	const allGuilds = await client.settings.keys;
	
	for (const guildID of allGuilds) await client.settings.ensure(guildID, defaultSettings);
}
