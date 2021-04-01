const defaultGuildSettings = require(`../database/defaultGuildSettings.json`);

module.exports = {
	name: `guildCreate`,
	once: false,
	async execute(client, guild) {
		await client.settings.set(guild.id, defaultGuildSettings);
	}
};
