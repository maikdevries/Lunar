module.exports = {
	name: 'guildDelete',
	once: false,
	execute
}

async function execute (client, guild) {
	await client.settings.delete(guild.id);
	await client.twitch.delete(guild.id);
	await client.youtube.delete(guild.id);
}
