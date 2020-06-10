const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'guildMemberAdd' & 'guildMemberRemove' events`,
	memberAdd,
	memberAddDM,
	memberRemove
};


// Sends out a welcome message when a new user joins the server
function memberAdd (client, member) {
	if (!config.welcomeMessage.welcome.enabled) return;

	if (config.welcomeMessage.welcome.channelID.length < 1) return console.error(`Cannot send welcome message, no welcome channels were specified in the config!`);

	config.welcomeMessage.welcome.channelID.forEach((channelID) => {
		const channel = member.guild.channels.cache.get(channelID);
		if (!channel) return console.error(`Cannot find welcome channel, couldn't send welcome message to ${channelID}.`);

		const botMember = channel.guild.members.cache.get(client.user.id);
		const channelPermissions = channel.permissionsFor(botMember);
		if (!channelPermissions.any('VIEW_CHANNEL') || !channelPermissions.any('SEND_MESSAGES')) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES) to send out welcome message to ${channel.name}!`);

		const messageArray = config.welcomeMessage.welcome.message;
		const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : '[MEMBER] has joined the Discord server!';

		return channel.send(message.replace(/\[MEMBER\]/, `${member}`));
	});
}

// Sends out a leave message when a user leaves the server
function memberRemove (client, member) {
	if (!config.welcomeMessage.leave.enabled) return;

	if (config.welcomeMessage.leave.channelID.length < 1) return console.error(`Cannot send leave message, no leave channels were specified in the config!`);

	config.welcomeMessage.leave.channelID.forEach((channelID) => {
		const channel = member.guild.channels.cache.get(channelID);
		if (!channel) return console.error(`Cannot find leave channel, couldn't send leave message to ${channelID}.`);

		const botMember = channel.guild.members.cache.get(client.user.id);
		const channelPermissions = channel.permissionsFor(botMember);
		if (!channelPermissions.any('VIEW_CHANNEL') || !channelPermissions.any('SEND_MESSAGES')) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES) to send out welcome message to ${channel.name}!`);

		const messageArray = config.welcomeMessage.leave.message;
		const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : '[MEMBER] has joined the Discord server!';

		return channel.send(message.replace(/\[MEMBER\]/, `${member}`));
	});
}

// Sends direct message to newly joined member of the server
function memberAddDM (member) {
	if (!config.welcomeMessage.direct.enabled) return;

	if (config.welcomeMessage.direct.message) member.send(config.welcomeMessage.direct.message);
	else member.send(`**Thanks for joining the Discord server**!\n*If you see this message, contact the server owner.*`);
}
