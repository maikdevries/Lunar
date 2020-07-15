const { channelPermissionsCheck } = require(`./../shared/permissionCheck.js`);

module.exports = {
	description: `Sends out a welcome/leave message on a member joining/leaving the Discord server`,
	memberAdd,
	memberRemove
};


function memberAdd (client, member) {
	const guildSettings = client.settings.get(member.guild.id, `welcomeMessage.welcome`);

	if (!guildSettings.enabled) return;
	if (!guildSettings.channels.length) return console.error(`Cannot send welcome message, setup not complete for guild: ${member.guild.id}!`);

	guildSettings.channels.forEach((channelID) => {
		const channel = member.guild.channels.cache.get(channelID);

		if (!channel) return console.error(`Cannot send welcome message for channel: ${channelID}, it no longer exists!`);
		if (!channelPermissionsCheck(client, channel, [`VIEW_CHANNEL`, `SEND_MESSAGES`])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES) to send out welcome message to ${channel.id}!`);

		const message = guildSettings.messages.length ? guildSettings.messages[Math.floor(Math.random() * guildSettings.messages.length)] : `[MEMBER] has joined the Discord server!`;
		return channel.send(message.replace(/\[MEMBER\]/, `${member}`));
	});
}

function memberRemove (client, member) {
	const guildSettings = client.settings.get(member.guild.id, `welcomeMessage.leave`);

	if (!guildSettings.enabled) return;
	if (!guildSettings.channels.length) return console.error(`Cannot send leave message, setup not complete for guild: ${member.guild.id}!`);

	guildSettings.channels.forEach((channelID) => {
		const channel = member.guild.channels.cache.get(channelID);

		if (!channel) return console.error(`Cannot send leave message for channel: ${channelID}, it no longer exists!`);
		if (!channelPermissionsCheck(client, channel, [`VIEW_CHANNEL`, `SEND_MESSAGES`])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES) to send out leave message to ${channel.id}!`);

		const message = guildSettings.messages.length ? guildSettings.messages[Math.floor(Math.random() * guildSettings.messages.length)] : `[MEMBER] has left the Discord server!`;
		return channel.send(message.replace(/\[MEMBER\]/, `${member}`));
	});
}
