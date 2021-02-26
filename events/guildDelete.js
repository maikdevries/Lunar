module.exports = {
	name: `guildDelete`,
	once: false,
	execute(client, guild) {
		client.settings.delete(guild.id);
	}
};
