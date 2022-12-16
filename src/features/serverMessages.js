const { PermissionFlagsBits } = require('discord.js');
const { checkChannelPermissions } = require('../shared/functions.js');

module.exports = {
	description: 'Send out a message when certain events happen in a server',
	execute
}

async function execute (client, guildMember, action) {
	const guildSettings = await client.settings.get(`${guildMember.guild.id}.serverMessages[${action}]`);
	if (!guildSettings.enabled) return;

	let channel;
	try { channel = await guildMember.guild.channels.fetch(guildSettings.channel) }
	catch { return }

	if (!checkChannelPermissions(client, channel, [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return;

	const message = guildSettings.messages.length ? guildSettings.messages[Math.floor(Math.random() * guildSettings.messages.length)] : guildSettings.defaultMessage;
	return await channel.send(message.replace(/\[MEMBER\]/, `**${guildMember.user.username}**`));
}
