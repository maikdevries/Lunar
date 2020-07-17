const Enmap = require(`enmap`);

const defaultGuildSettings = require(`./defaultGuildSettings.json`);

module.exports = {
	description: `Sets up the required database instances for the bot to function properly`,
	setup
}


async function setup (client) {
	client.settings = new Enmap({
		name: `settings`,
		fetchAll: false,
		autoFetch: true,
		cloneLevel: `deep`,
		ensureProps: true
	});

	client.twitch = new Enmap({
		name: `twitch`,
		fetchAll: false,
		autoFetch: true,
		cloneLevel: `deep`,
		ensureProps: true
	});

	client.youtube = new Enmap({
		name: `youtube`,
		fetchAll: false,
		autoFetch: true,
		cloneLevel: `deep`,
		ensureProps: true
	});

	await client.settings.defer;
	await client.twitch.defer;
	await client.youtube.defer;

	return await ensureGuilds();
}

async function ensureGuilds (client) {
	client.guilds.cache.forEach((guild) => {
		if (!client.settings.has(guild.id)) return client.emit(`guildCreate`, guild);
		return client.settings.ensure(guild.id, defaultGuildSettings);
	});
}
