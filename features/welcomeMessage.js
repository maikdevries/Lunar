const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'guildMemberAdd' & 'guildMemberRemove' events`,
	memberAdd,
	memberAddDM,
	memberRemove
};


// Sends out a welcome message when a new user joins the server
function memberAdd (member) {
	if (!config.welcomeMessage.enabled) return;

	let channel;
	if (config.welcomeMessage.channelID) channel = member.guild.channels.get(config.welcomeMessage.channelID);
	else channel = member.guild.channels.find((ch) => ch.name === 'welcome');

	if (channel) return channel.send(`**${member.user.username}** has joined the Discord server! Give a warm welcome!`);

	console.error(`Cannot find welcome channel, couldn't send welcome message.`);
}

// Sends out a leave message when a user leaves the server
function memberRemove (member) {
	if (!config.welcomeMessage.enabled) return;

	let channel;
	if (config.welcomeMessage.channelID) channel = member.guild.channels.get(config.welcomeMessage.channelID);
	else channel = member.guild.channels.find((ch) => ch.name === 'welcome');

	if (channel) return channel.send(`**${member.user.username}** has left the Discord server! What a shame!`);

	console.error(`Cannot find welcome channel, couldn't send leave message.`);
}

// Sends direct message to newly joined member of the server
function memberAddDM (member) {
	if (!config.welcomeMessage['DM-enabled']) return;

	if (config.welcomeMessage['DM-message']) member.send(config.welcomeMessage['DM-message']);
	else member.send(`**Thanks for joining the Discord server**!\n*If you see this message, contact the server owner.*`);
}
