module.exports = {
	name: `guildDelete`,
	once: false,
	async execute(client, guild) {
		await client.settings.delete(guild.id);
	}
};
