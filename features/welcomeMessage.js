const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'guildMemberAdd' & 'guildMemberRemove' events`,
	memberAdd,
	memberRemove
};


// Sends out a welcome message when a new user joins the server
function memberAdd (member) {
	if (!config.welcomeMessageAdd) return;

	let channel;
	if (config.welcomeMessageChannelID) channel = member.guild.channels.get(config.welcomeMessageChannelID);
	else if (config.welcomeMessageChannelName) channel = member.guild.channels.find((ch) => ch.name === config.welcomeMessageChannelName);
	else channel = member.guild.channels.find((ch) => ch.name === 'welcome');

	if (channel) return channel.send(`**${member.user.username}** has joined the Discord server! Give a warm welcome!`);

	console.error(`Cannot find welcome channel, couldn't send welcome message.`);
}

// Sends out a leave message when an user leaves the server
function memberRemove (member) {
	if (!config.welcomeMessageRemove) return;

	let channel;
	if (config.welcomeMessageChannelID) channel = member.guild.channels.get(config.welcomeMessageChannelID);
	else if (config.welcomeMessageChannelName) channel = member.guild.channels.find((ch) => ch.name === config.welcomeMessageChannelName);
	else channel = member.guild.channels.find((ch) => ch.name === 'welcome');

	if (channel) return channel.send(`**${member.user.username}** has left the Discord server! What a shame!`);

	console.error(`Cannot find welcome channel, couldn't send leave message.`);
}
