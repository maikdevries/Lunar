const defaultGuildSettings = require(`../database/defaultGuildSettings.json`);

module.exports = {
	name: `guildCreate`,
	once: false,
	execute(client, guild) {
		client.settings.set(guild.id, defaultGuildSettings);
	}
};
