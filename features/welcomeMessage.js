const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');


module.exports = {
	description: `Handles both the 'guildMemberAdd' & 'guildMemberRemove' events`,
	memberAdd,
	memberRemove
};


// Sends out a welcome message when a new user joins the server
function memberAdd (client, member) {
	const guildSettings = client.settings.get(member.guild.id, 'welcomeMessage.welcome');

	if (!guildSettings.enabled) return;

	if (!guildSettings.channels.length) return console.error(`Cannot send welcome message, no welcome channels were specified in the config!`);

	guildSettings.channels.forEach((channelID) => {
		const channel = member.guild.channels.cache.get(channelID);
		if (!channel) return console.error(`Cannot find welcome channel, couldn't send welcome message to ${channelID}.`);

		if (!channelPermissionsCheck(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES'])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES) to send out welcome message to ${channel.name}!`);

		const messageArray = guildSettings.messages;
		const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : '[MEMBER] has joined the Discord server!';

		return channel.send(message.replace(/\[MEMBER\]/, `${member}`));
	});
}

// Sends out a leave message when a user leaves the server
function memberRemove (client, member) {
	const guildSettings = client.settings.get(member.guild.id, 'welcomeMessage.leave');

	if (!guildSettings.enabled) return;

	if (guildSettings.channels.length) return console.error(`Cannot send leave message, no leave channels were specified in the config!`);

	guildSettings.channels.forEach((channelID) => {
		const channel = member.guild.channels.cache.get(channelID);
		if (!channel) return console.error(`Cannot find leave channel, couldn't send leave message to ${channelID}.`);

		if (!channelPermissionsCheck(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES'])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES) to send out welcome message to ${channel.name}!`);

		const messageArray = guildSettings.messages;
		const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : '[MEMBER] has joined the Discord server!';

		return channel.send(message.replace(/\[MEMBER\]/, `${member}`));
	});
}
