const { MessageEmbed } = require('discord.js');

const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');


module.exports = {
	name: 'settings',
	aliases: ['options'],
	description: 'A command used to change Guild settings for the current Discord Guild',
	usage: `[PREFIX]settings [feature] [property] (sub-properties) (operation) [value]`,

	execute
};


const CONFIRM_REACTION = '✅';
const DENY_REACTION = '🚫';

const BOOLEAN_TRUE = { name: 'true', description: 'Set this setting to true' };
const BOOLEAN_FALSE = { name: 'false', description: 'Set this setting to false' };

const CHANNEL_ADD = { name: 'add', description: 'Add a channel to the list' };
const CHANNEL_REMOVE = { name: 'remove', description: 'Remove a channel from the list' };
const CHANNEL_CLEAR = { name: 'clear', description: 'Clear the list of channels' };

const COMMAND_ENABLE = { name: 'enabled', description: 'Enable or disable a command' };
const COMMAND_RESTRICT = { name: 'restricted', description: 'Enable or disable command restriction to specified channel(s)' };

const COMMANDS_PREFIX = { name: 'prefix', description: 'Set the command prefix for this Discord server' };
const COMMANDS_RESTRICTED_CHANNEL = { name: 'restrictedChannel', description: 'Set the command prefix for this Discord server' };
const COMMANDS_ASK = { name: '8ball', description: 'Change settings related to the 8ball command' };
const COMMANDS_ABOUT = { name: 'about', description: 'Change settings related to the about command' };
const COMMANDS_BAN = { name: 'ban', description: 'Change settings related to the ban command' };
const COMMANDS_CLEAR = { name: 'clear', description: 'Change settings related to the clear command' };
const COMMANDS_INVITE = { name: 'invite', description: 'Change settings related to the invite command' };
const COMMANDS_KICK = { name: 'kick', description: 'Change settings related to the kick command' };
const COMMANDS_NICKNAME = { name: 'nickname', description: 'Change settings related to the nickname command' };
const COMMANDS_SLOWMODE = { name: 'slowmode', description: 'Change settings related to the slowmode command' };
const COMMANDS_SETTINGS = [COMMANDS_PREFIX, COMMANDS_RESTRICTED_CHANNEL, COMMANDS_ASK, COMMANDS_ABOUT, COMMANDS_BAN, COMMANDS_CLEAR, COMMANDS_INVITE, COMMANDS_KICK, COMMANDS_NICKNAME, COMMANDS_SLOWMODE];

const FEATURE_COMMANDS = { name: 'commands', description: 'Change settings related to commands' };
const FEATURE_REACTIONROLE = { name: 'reactionRole', description: 'Change settings related to the Reaction Role feature' };
const FEATURE_SERVERLOCK = { name: 'serverLock', description: 'Change settings related to the Server Lock feature' };
const FEATURE_STREAMSTATUS = { name: 'streamStatus', description: 'Change settings related to the Stream Status feature' };
const FEATURE_TWITCH = { name: 'twitch', description: 'Change settings related to the Twitch feature' };
const FEATURE_WELCOMEMESSAGE = { name: 'welcomeMessage', description: 'Change settings related to the Welcome Message feature' };
const FEATURE_YOUTUBE = { name: 'youtube', description: 'Change settings related to the YouTube feature' };
const FEATURE_SETTINGS = [FEATURE_COMMANDS, FEATURE_REACTIONROLE, FEATURE_SERVERLOCK, FEATURE_STREAMSTATUS, FEATURE_TWITCH, FEATURE_WELCOMEMESSAGE, FEATURE_YOUTUBE];



function execute (client, message, args) {
	if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	if (!channelPermissionsCheck(client, message.channel, ['ADD_REACTIONS'])) return console.error(`Missing permissions (ADD_REACTIONS) to execute command in ${message.channel.name}!`);

	switch (args[0]) {
		case 'commands': return commandSettings(client, message, args);

		case 'reactionRole': return reactionRoleSettings(client, message, args);

		case 'serverLock': return serverLockSettings(client, message, args);

		case 'streamStatus': return streamStatusSettings(client, message, args);

		case 'twitch': return twitchSettings(client, message, args);

		case 'welcomeMessage': return welcomeMessageSettings(client, message, args);

		case 'youtube': return youtubeSettings(client, message, args);

		default: return message.channel.send(possibleSettings(client, FEATURE_SETTINGS));
	}
}


function commandSettings (client, message, args) {
	switch (args[1]) {
		case 'prefix': return commandPrefixSettings(client, message, args);

		case 'restrictedChannel': return commandRestrictedChannelSettings(client, message, args);

		case '8ball': return commandAskResponseSettings(client, message, args);

		case 'about':
		case 'ban':
		case 'clear':
		case 'invite':
		case 'kick':
		case 'nickname':
		case 'slowmode': return commandSpecificSettings(client, message, args, args[1]);

		default: return message.channel.send(possibleSettings(client, COMMANDS_SETTINGS));
	}
}


function reactionRoleSettings (client, message, args) {

}

function serverLockSettings (client, message, args) {

}

function streamStatusSettings (client, message, args) {

}

function twitchSettings (client, message, args) {

}

function welcomeMessageSettings (client, message, args) {

}

function youtubeSettings (client, message, args) {

}


function commandPrefixSettings (client, message, args) {
	if (!args[2]) return message.channel.send(`**Ouch**! You didn't specify what to change the prefix to! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
	client.settings.set(message.guild.id, args[2], 'commands.prefix');
	return message.channel.send(`**Nice**! Successfully changed the commands prefix to **${args[2]}**`).then((msg) => msg.delete({ timeout: 3500 }));
}


function commandRestrictedChannelSettings (client, message, args) {
	switch (args[2]) {
		case 'add': return commandAddRestrictedChannel(client, message, args);

		case 'remove': return commandRemoveRestrictedChannel(client, message, args);

		case 'clear': return commandClearRestrictedChannel(client, message, args);

		default: return message.channel.send(possibleSettings(client, [CHANNEL_ADD, CHANNEL_REMOVE, CHANNEL_CLEAR]));
	}
}

function commandAddRestrictedChannel (client, message, args) {
	if (!message.mentions.channels.size || !args[3]) return message.channel.send(`**Ouch**! You didn't mention the channel to be added! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	const channel = isChannel(client, args[3]);
	if (!channel) return message.channel.send(`**Oops**! This isn't a channel and thus cannot be added!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.push(message.guild.id, channel.id, 'commands.channelID');
	return message.channel.send(`**Nice**! Successfully allowed the use of commands in that channel!`).then((msg) => msg.delete({ timeout: 3500 }));
}

function commandRemoveRestrictedChannel (client, message, args) {
	if (!message.mentions.channels.size || !args[3]) return message.channel.send(`**Ouch**! You didn't mention the channel to be removed! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	const channel = isChannel(client, args[3]);
	if (!channel) return message.channel.send(`**Oops**! This isn't a channel and thus cannot be removed!`).then((msg) => msg.delete({ timeout: 3500 }));

	if (!client.settings.includes(message.guild.id, channel.id, 'commands.channelID')) return message.channel.send(`**Oh no**! This channel wasn't part of the list to begin with!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.remove(message.guild.id, channel.id, 'commands.channelID');
	return message.channel.send(`**Nice**! Successfully disabled the use of commands in that channel!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function commandClearRestrictedChannel (client, message) {
	if (!await confirmChange(message)) return;

	client.settings.set(message.guild.id, [], 'commands.channelID');
	return message.channel.send(`**Nice**! Successfully cleared the list of restricted channels!`).then((msg) => msg.delete({ timeout: 3500 }));
}


function commandSpecificSettings (client, message, args, command) {
	switch (args[2]) {
		case 'enabled':
			switch (args[3]) {
				case 'true': return commandChangeEnabledSettings(client, message, command, true);

				case 'false': return commandChangeEnabledSettings(client, message, command, false);

				default: return message.channel.send(possibleSettings(client, [BOOLEAN_TRUE, BOOLEAN_FALSE]));
			}

		case 'restricted':
			switch (args[3]) {
				case 'true': return commandChangeRestrictionSettings(client, message, command, true);

				case 'false': return commandChangeRestrictionSettings(client, message, command, false);

				default: return message.channel.send(possibleSettings(client, [BOOLEAN_TRUE, BOOLEAN_FALSE]));
			}

		default: return message.channel.send(possibleSettings(client, [COMMAND_ENABLE, COMMAND_RESTRICT]));
	}
}


function commandChangeEnabledSettings (client, message, command, boolean) {
	client.settings.set(message.guild.id, boolean, `commands[${command}].enabled`);
	return message.channel.send(`**Nice**! Successfully changed the \`enabled\` property of **${command}** to **${boolean}**!`).then((msg) => msg.delete({ timeout: 3500 }));
}


function commandChangeRestrictionSettings (client, message, command, boolean) {
	client.settings.set(message.guild.id, boolean, `commands[${command}].restricted`);
	return message.channel.send(`**Nice**! Successfully changed the \`restricted\` property of **${command}** to **${boolean}**!`).then((msg) => msg.delete({ timeout: 3500 }));
}


function commandAskResponseSettings (client, message, args) {
	switch (args[2]) {
		case 'add': return commandAskAddResponseSettings(client, message, args);

		case 'remove': return commandAskRemoveResponseSettings(client, message, args);

		case 'clear': return commandAskClearResponseSettings(client, message);

		default: return commandSpecificSettings(client, message, args, args[1]);
	}
}

function commandAskAddResponseSettings (client, message, args) {
	if (!args[3]) return message.channel.send(`**Ouch**! You didn't specify a response to be added! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.push(message.guild.id, args[3], 'commands[8ball].responses');
	return message.channel.send(`**Nice**! Successfully added **${args[3]}** to the list of responses!`).then((msg) => msg.delete({ timeout: 3500 }));
}

function commandAskRemoveResponseSettings (client, message, args) {
	if (!args[3]) return message.channel.send(`**Ouch**! You didn't specify the response to be removed! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!client.settings.includes(message.guild.id, args[3], 'commands[8ball].responses')) return message.channel.send(`**Oh no**! This response wasn't part of the list to begin with!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.remove(message.guild.id, args[3], 'commands[8ball].responses');
	return message.channel.send(`**Nice**! Successfully removed **${args[3]}** from the list of responses!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function commandAskClearResponseSettings (client, message) {
	if (!await confirmChange(message)) return;

	client.settings.set(message.guild.id, [], 'commands[8ball].responses');
	return message.channel.send(`**Nice**! Successfully cleared the list of responses!`).then((msg) => msg.delete({ timeout: 3500 }));
}


async function confirmChange (message) {
	return new Promise(async (resolve) => {
		message.channel.send(`**WARNING**! This action is irreversible! Do you want to continue?`).then(async (confirmationMessage) => {
			await confirmationMessage.react(CONFIRM_REACTION);
			await confirmationMessage.react(DENY_REACTION);

			const filter = (reaction, user) => user.id === message.author.id && (reaction.emoji.name === CONFIRM_REACTION || reaction.emoji.name === DENY_REACTION);
			confirmationMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then((collected) => {
				const confirmation = collected.firstKey() === CONFIRM_REACTION ? true : false;
				if (!confirmation) message.channel.send(`**Alrighty**! If you change your mind, please use the command again.`).then((msg) => msg.delete({ timeout: 3500 }));

				confirmationMessage.delete();
				resolve(confirmation);
			}).catch(() => {
				confirmationMessage.delete();
				message.channel.send(`**Oh oh**... You weren't able to confirm in time, please try again!`);
				resolve(false)
			});
		});
	});
}


function possibleSettings (client, settings) {
	const embed = new MessageEmbed()
		.setAuthor(`Change the bot configuration for this server!`, client.user.avatarURL())
		.setTitle(`Possible settings to change:`)
		.setColor(`#233A54`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date());

	settings.forEach((setting) => embed.addField(setting.name, setting.description));

	return embed;
}


function isChannel (client, channel) {
	const matches = channel.match(/^<#(\d+)>$/);
	return matches ? client.channels.cache.get(matches[1]) : false;
}
