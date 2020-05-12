const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'guildMemberAdd' & 'guildMemberRemove' events`,
	memberAdd,
	memberAddDM,
	memberRemove
};


// Sends out a welcome message when a new user joins the server
function memberAdd (member) {
	if (!config.welcomeMessage.welcome.enabled) return;

	const messageArray = config.welcomeMessage.welcome.message;
	const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : '[MEMBER] has joined the Discord server!';

	const channel = member.guild.channels.cache.get(config.welcomeMessage.welcome.channelID);
	if (channel) return channel.send(message.replace(/\[MEMBER\]/, `${member}`));

	console.error(`Cannot find welcome channel, couldn't send welcome message.`);
}

// Sends out a leave message when a user leaves the server
function memberRemove (member) {
	if (!config.welcomeMessage.leave.enabled) return;

	const messageArray = config.welcomeMessage.leave.message;
	const message = messageArray.length > 0 ? messageArray[Math.floor(Math.random() * messageArray.length)] : '[MEMBER] has left the Discord server!';

	const channel = member.guild.channels.cache.get(config.welcomeMessage.leave.channelID);
	if (channel) return channel.send(message.replace(/\[MEMBER\]/, `${member}`));

	console.error(`Cannot find welcome channel, couldn't send leave message.`);
}

// Sends direct message to newly joined member of the server
function memberAddDM (member) {
	if (!config.welcomeMessage.direct.enabled) return;

	if (config.welcomeMessage.direct.message) member.send(config.welcomeMessage.direct.message);
	else member.send(`**Thanks for joining the Discord server**!\n*If you see this message, contact the server owner.*`);
}
