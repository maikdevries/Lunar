require(`dotenv`).config()
const Josh = require(`@joshdb/core`);
const provider = require(`@joshdb/mongo`);

const defaultGuildSettings = require(`./defaultGuildSettings.json`);

module.exports = {
	description: `Sets up the required database instances for the bot to function properly`,
	setup
}


async function setup (client) {
	client.settings = new Josh({
		name: `settings`,
		provider,
		providerOptions: {
			collection: `settings`,
			dbName: `Lunar`,
			url: `mongodb+srv://${process.env.DATABASE_URL}?retryWrites=true&w=majority`
		},
		ensureProps: true
	});

	client.twitch = new Josh({
		name: `twitch`,
		provider,
		providerOptions: {
			collection: `twitch`,
			dbName: `Lunar`,
			url: `mongodb+srv://${process.env.DATABASE_URL}?retryWrites=true&w=majority`
		},
		ensureProps: true
	});

	client.youtube = new Josh({
		name: `youtube`,
		provider,
		providerOptions: {
			collection: `youtube`,
			dbName: `Lunar`,
			url: `mongodb+srv://${process.env.DATABASE_URL}?retryWrites=true&w=majority`
		},
		ensureProps: true
	});

	return await ensureGuilds(client);
}

function ensureGuilds (client) {
	client.guilds.cache.forEach(async (guild) => {
		if (!await client.settings.has(guild.id)) return await client.settings.set(guild.id, defaultGuildSettings)
		return await client.settings.ensure(guild.id, defaultGuildSettings);
	});
}
