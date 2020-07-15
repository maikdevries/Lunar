const Enmap = require(`enmap`);

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
}
