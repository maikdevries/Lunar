const { MessageEmbed } = require('discord.js');

const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');

const defaultGuildSettings = require('./../defaultGuildSettings.json');


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

const LIST_CHANNELS = { name: 'channels', description: 'Modify the list of channels' };
const LIST_MESSAGES = { name: 'messages', description: 'Modify the list of messages' };

const MESSAGE_ADD = { name: 'add', description: 'Add a response to the list' };
const MESSAGE_REMOVE = { name: 'remove', description: 'Remove a response from the list' };
const MESSAGE_CLEAR = { name: 'clear', description: 'Clear the list of responses' };
const MESSAGE_RESET = { name: 'reset', description: 'Reset the list of responses' };

const FEATURE_ENABLE = { name: 'enabled', description: 'Enable or disable this feature' };
const COMMAND_RESTRICT = { name: 'restricted', description: 'Enable or disable command restriction to specified channel(s)' };

const COMMANDS_PREFIX = { name: 'prefix', description: 'Set the command prefix for this Discord server' };
const COMMANDS_RESTRICTED_CHANNEL = { name: 'restrictedChannel', description: 'Modify the list of restricted channels' };
const COMMANDS_ASK = { name: '8ball', description: 'Change settings related to the 8ball command' };
const COMMANDS_ABOUT = { name: 'about', description: 'Change settings related to the about command' };
const COMMANDS_BAN = { name: 'ban', description: 'Change settings related to the ban command' };
const COMMANDS_CLEAR = { name: 'clear', description: 'Change settings related to the clear command' };
const COMMANDS_INVITE = { name: 'invite', description: 'Change settings related to the invite command' };
const COMMANDS_KICK = { name: 'kick', description: 'Change settings related to the kick command' };
const COMMANDS_NICKNAME = { name: 'nickname', description: 'Change settings related to the nickname command' };
const COMMANDS_SLOWMODE = { name: 'slowmode', description: 'Change settings related to the slowmode command' };
const COMMANDS_SETTINGS = [COMMANDS_PREFIX, COMMANDS_RESTRICTED_CHANNEL, COMMANDS_ASK, COMMANDS_ABOUT, COMMANDS_BAN, COMMANDS_CLEAR, COMMANDS_INVITE, COMMANDS_KICK, COMMANDS_NICKNAME, COMMANDS_SLOWMODE];

const WELCOME_WELCOME = { name: 'welcome', description: 'Change settings related to welcome messages' };
const WELCOME_LEAVE = { name: 'leave', description: 'Change settings related to leave messages' };

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
		case 'prefix': return commandPrefixSettings(client, message, args[2]);

		case 'restrictedChannel': return handleChannelSettings(client, message, args[2], args[3], 'commands');

		case '8ball': return commandAskSettings(client, message, args);

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
	switch (args[1]) {
		case 'welcome': return welcomeMessageSharedSettings(client, message, args, 'welcome');

		case 'leave': return welcomeMessageSharedSettings(client, message, args, 'leave');

		default: return message.channel.send(possibleSettings(client, [WELCOME_WELCOME, WELCOME_LEAVE]));
	}
}


function youtubeSettings (client, message, args) {

}


function welcomeMessageSharedSettings (client, message, args, path) {
	switch (args[2]) {
		case 'enabled': return handleEnabledSettings(client, message, args[3], `welcomeMessage.${path}`);

		case 'channels': return handleChannelSettings(client, message, args[3], args[4], `welcomeMessage.${path}`);

		case 'messages': {
			const newMessage = args.slice(4).join(' ');
			if (!newMessage.includes('[MEMBER]')) return message.channel.send(`**Ehh**... You forgot to include \`[MEMBER]\` as part of the message! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
			return handleMessageSettings(client, message, args[3], newMessage, `welcomeMessage.${path}`);
		}

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, LIST_CHANNELS, LIST_MESSAGES]));
	}
}


function commandPrefixSettings (client, message, newPrefix) {
	if (!newPrefix) return message.channel.send(`**Ouch**! You didn't specify what to change the prefix to! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.set(message.guild.id, newPrefix, 'commands.prefix');
	return message.channel.send(`**Nice**! Successfully changed the commands prefix to **${newPrefix}**`).then((msg) => msg.delete({ timeout: 3500 }));
}

function commandAskSettings (client, message, args) {
	switch (args[2]) {
		case 'enabled':
		case 'restricted': return commandSpecificSettings(client, message, args, '8ball');

		case 'messages': return handleMessageSettings(client, message, args[3], args.slice(4).join(' '), 'commands.8ball');

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, COMMAND_RESTRICT, LIST_MESSAGES]));
	}
}

function commandSpecificSettings (client, message, args, command) {
	switch (args[2]) {
		case 'enabled': return handleEnabledSettings(client, message, args[3], `commands[${command}]`);

		case 'restricted':
			switch (args[3]) {
				case 'true': return commandChangeRestrictionSettings(client, message, command, true);

				case 'false': return commandChangeRestrictionSettings(client, message, command, false);

				default: return message.channel.send(possibleSettings(client, [BOOLEAN_TRUE, BOOLEAN_FALSE]));
			}

		default: return message.channel.send(possibleSettings(client, [FEATURE_ENABLE, COMMAND_RESTRICT]));
	}
}

function commandChangeRestrictionSettings (client, message, command, boolean) {
	client.settings.set(message.guild.id, boolean, `commands[${command}].restricted`);
	return message.channel.send(`**Nice**! Successfully changed the \`restricted\` property of **${command}** to **${boolean}**!`).then((msg) => msg.delete({ timeout: 3500 }));
}


function handleEnabledSettings (client, message, arg, path) {
	switch (arg) {
		case 'true': return changeEnabledSettings(client, message, true, path);

		case 'false': return changeEnabledSettings(client, message, false, path);

		default: return message.channel.send(possibleSettings(client, [BOOLEAN_TRUE, BOOLEAN_FALSE]));
	}
}

function handleChannelSettings (client, message, action, arg, path) {
	switch (action) {
		case 'add': return addChannelSettings(client, message, arg, path);

		case 'remove': return removeChannelSettings(client, message, arg, path);

		case 'clear': return clearChannelSettings(client, message, path);

		default: return message.channel.send(possibleSettings(client, [CHANNEL_ADD, CHANNEL_REMOVE, CHANNEL_CLEAR]));
	}
}

function handleMessageSettings (client, message, action, arg, path) {
	switch (action) {
		case 'add': return addMessageSettings(client, message, arg, path);

		case 'remove': return removeMessageSettings(client, message, arg, path);

		case 'clear': return clearMessageSettings(client, message, path);

		case 'reset': return resetMessageSettings(client, message, path);

		default: return message.channel.send(possibleSettings(client, [MESSAGE_ADD, MESSAGE_REMOVE, MESSAGE_CLEAR, MESSAGE_RESET]));
	}
}


function changeEnabledSettings (client, message, boolean, path) {
	client.settings.set(message.guild.id, boolean, `${path}.enabled`);
	return message.channel.send(`**Nice**! Successfully changed the \`enabled\` property of **${path}** to **${boolean}**!`).then((msg) => msg.delete({ timeout: 3500 }));
}

function addChannelSettings (client, message, channelMention, path) {
	const channel = parseChannel(client, message, channelMention);
	if (!channel) return;

	client.settings.push(message.guild.id, channel.id, `${path}.channels`);
	return message.channel.send(`**Nice**! Successfully added the channel to the list!`).then((msg) => msg.delete({ timeout: 3500 }));
}

function removeChannelSettings (client, message, channelMention, path) {
	const channel = parseChannel(client, message, channelMention);
	if (!channel) return;

	client.settings.remove(message.guild.id, channel.id, `${path}.channels`);
	return message.channel.send(`**Nice**! Successfully removed the channel from the list!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function clearChannelSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	client.settings.set(message.guild.id, [], `${path}.channels`);
	return message.channel.send(`**Nice**! Successfully cleared the list of channels!`).then((msg) => msg.delete({ timeout: 3500 }));
}

function addMessageSettings (client, message, response, path) {
	if (!response) return message.channel.send(`**Ouch**! You forgot to specify a response to add to the list! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.push(message.guild.id, response, `${path}.messages`);
	return message.channel.send(`**Nice**! Successfully added the response to the list!`).then((msg) => msg.delete({ timeout: 3500 }));
}

function removeMessageSettings (client, message, response, path) {
	if (!response) return message.channel.send(`**Oops**! You forgot to specify a response to remove from the list! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!client.settings.includes(message.guild.id, response, `${path}.messages`)) return message.channel.send(`**Oh no**! This response wasn't part of the list to begin with!`).then((msg) => msg.delete({ timeout: 3500 }));

	client.settings.remove(message.guild.id, response, `${path}.messages`);
	return message.channel.send(`**Nice**! Successfully removed the response from the list!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function clearMessageSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	client.settings.set(message.guild.id, [], `${path}.messages`);
	return message.channel.send(`**Nice**! Successfully cleared the list of responses!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function resetMessageSettings (client, message, path) {
	if (!await confirmChange(message)) return;

	let settings = defaultGuildSettings;
	path.split('.').forEach((key) => settings = settings[key]);

	client.settings.set(message.guild.id, settings.messages, `${path}.messages`);
	return message.channel.send(`**Nice**! Successfully reset the list of responses!`).then((msg) => msg.delete({ timeout: 3500 }));
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


function parseChannel (client, message, channelMention) {
	if (!message.mentions.channels.size || !channelMention) {
		message.channel.send(`**Ouch**! You forgot to mention a channel in your message! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	const matches = channelMention.match(/^<#(\d+)>$/);
	if (!matches) {
		message.channel.send(`**Oops**! This doesn't seem to be a channel! Try again!`).then((msg) => msg.delete({ timeout: 3500 }));
		return false;
	}

	return client.channels.cache.get(matches[1]);
}
