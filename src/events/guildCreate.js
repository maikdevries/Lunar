const defaultSettings = require('../database/defaultSettings.json');

module.exports = {
	name: 'guildCreate',
	once: false,
	execute
}

async function execute (client, guild) {
	await client.settings.set(guild.id, defaultSettings);
}
