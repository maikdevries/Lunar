const { checkChannelPermissions } = require('../shared/functions.js');

module.exports = {
	description: 'Manages messages sent out when members join or leave the server',
	execute
}

async function execute (client, guildMember, action) {
	const guildSettings = await client.settings.get(`${guildMember.guild.id}.welcomeMessage[${action}]`);
	if (!guildSettings.enabled) return;

	const message = guildSettings.messages.length ? guildSettings.messages[Math.floor(Math.random() * guildSettings.messages.length)] : guildSettings.defaultMessage;

	for (const channelID of guildSettings.channels) {
		let channel;
		try { channel = await guildMember.guild.channels.fetch(channelID) }
		catch { continue }

		if (!checkChannelPermissions(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES'])) continue;

		await channel.send(message.replace(/\[MEMBER\]/, `**${guildMember.user.username}**`));
	}
}
