const { channelPermissionsCheck } = require(`./../shared/permissionCheck.js`);
const validateTwitchChannel = require(`./../features/twitch.js`).validateChannel;
const validateYouTubeChannel = require(`./../features/youtube.js`).validateChannel;

const settings = require(`./settings.js`);

module.exports = {
	name: `setup`,
	aliases: [],
	description: `A command used to easily configure the bot one feature at a time`,
	args: false,
	usage: `[PREFIX]setup [feature]`,
	execute
}


function execute (client, message, args) {
	if (!message.member.hasPermission(`MANAGE_GUILD`)) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!channelPermissionsCheck(client, message.channel, [`ADD_REACTIONS`])) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	switch (args[0]) {
		case `commands`: return commandsSetup(client, message);

		case `reactionRole`: return reactionRoleSetup(client, message);

		case `serverLock`: return serverLockSetup(client, message);

		case `streamStatus`: return streamStatusSetup(client, message);

		case `twitch`: return twitchSetup(client, message);

		case `welcomeMessage`: return welcomeMessageSetup(client, message);

		case `youtube`: return youtubeSetup(client, message);

		default: return message.channel.send(settings.possibleSettings(client, settings.FEATURE_SETTINGS));
	}
}


async function commandsSetup (client, message) {
	const pollPrefix = await message.channel.send(`Just a quick setup for the **Commands** feature. What prefix do you want to use?`);
	const newPrefix = await settings.collectResponse(message);

	if (!newPrefix) return pollPrefix.delete();
	message.channel.bulkDelete([pollPrefix, newPrefix], true);

	let pollChannel = await message.channel.send(`Almost done, what channel do you want to restrict commands to? Say '**NO**' if not applicable.`);
	const response = await settings.collectResponse(message);
	if (!response) return pollChannel.delete();

	let newChannel;
	if (response.content === `NO`) newChannel = `NO`;
	else newChannel = await settings.parseChannel(client, response, response.content);

	message.channel.bulkDelete([pollChannel, response], true);
	if (!newChannel) return;

	client.settings.set(message.guild.id, newPrefix.content, `commands.prefix`);
	if (newChannel !== `NO`) client.settings.set(message.guild.id, [newChannel.id], `commands.channels`);

	return message.channel.send(`**Perfect**. You can now use **Commands** throughout the Discord! You can change settings for individual commands through the \`!settings\` command.`).then((msg) => msg.delete({ timeout: 5000 }));
}

async function reactionRoleSetup (client, message) {
	const pollMessage = await message.channel.send(`Let's go through the process of setting up a **Reaction Role**! What message we talking?`);
	const newMessage = await settings.requestMessage(message);

	pollMessage.delete();
	if (!newMessage) return;

	const pollReaction = await message.channel.send(`What emoji do members have to react with to get the reaction role?`);
	const newReaction = await settings.requestEmoji(message);

	pollReaction.delete();
	if (!newReaction) return;

	const pollRole = await message.channel.send(`Finally, what role do members get by reacting with that emoji to the message?`);
	const newRole = await settings.requestRole(message);

	pollRole.delete();
	if (!newRole) return;

	client.settings.set(message.guild.id, true, `reactionRole.enabled`);
	return settings.addReactionRoleSettings(client, message, newMessage, newReaction, newRole);
}

async function serverLockSetup (client, message) {
	const pollRole = await message.channel.send(`Let me walk you through the setup for the **Server Lock** feature. First of all, what is the role that will lock members out of the Discord?`);
	const newRole = await settings.requestRole(message);

	pollRole.delete();
	if (!newRole) return;

	const pollChannel = await message.channel.send(`Second of all, in what channel can new members unlock the Discord?`);
	const newChannel = await settings.requestChannel(client, message);

	pollChannel.delete();
	if (!newChannel) return;

	const pollMessage = await message.channel.send(`In that channel, what message do they have to react to in order to unlock the Discord?`);
	const newMessage = await settings.requestMessage(message);

	pollMessage.delete();
	if (!newMessage) return;

	try { await newChannel.messages.fetch(newMessage) }
	catch { return message.channel.send(`**Oops**... That message doesn't seem to be part of that channel. Try again!`).then((msg) => msg.delete({ timeout: 3500 })) }

	const pollReaction = await message.channel.send(`For that message, what emoji do they need to react with to unlock the Discord?`);
	const newEmoji = await settings.requestEmoji(message);

	pollReaction.delete();
	if (!newEmoji) return;

	client.settings.set(message.guild.id, newRole.id, `serverLock.role`);
	client.settings.set(message.guild.id, { [newMessage]: newEmoji }, `serverLock.message`)
	client.settings.set(message.guild.id, true, `serverLock.enabled`);

	return message.channel.send(`**Perfect**. You've completed the setup for the **Server Lock** feature!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function streamStatusSetup (client, message) {
	let pollRole = await message.channel.send(`Let's go through the setup for **Stream Status**. First on the list, is there a required role to receive the shoutout? If not, respond with '**NO**'.`);
	const response = await settings.collectResponse(message);
	if (!response) return pollRole.delete();

	let requiredRole;
	if (response.content === `NO`) requiredRole = `NO`;
	else requiredRole = await settings.parseRole(response, response.content);

	message.channel.bulkDelete([pollRole, response], true);
	if (!requiredRole) return;

	pollRole = await message.channel.send(`Let's go through the setup for **Stream Status**. Secondly, what is the shoutout role?`);
	const statusRole = await settings.requestRole(message);

	pollRole.delete();
	if (!statusRole) return;

	if (requiredRole !== `NO`) client.settings.set(message.guild.id, requiredRole.id, `streamStatus.streamerRole`);
	client.settings.set(message.guild.id, statusRole.id, `streamStatus.statusRole`);
	client.settings.set(message.guild.id, true, `streamStatus.enabled`);

	return message.channel.send(`**Perfect**. **Stream Status** is ready to use!`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function twitchSetup (client, message) {
	const pollUsername = await message.channel.send(`Time to set up the next feature: **Twitch**! What Twitch channel do you want to receive announcements for?`);
	const usernameMessage = await settings.collectResponse(message);

	if (!usernameMessage) return pollUsername.delete();
	const newUsername = await validateTwitchChannel(message, usernameMessage.content);

	message.channel.bulkDelete([pollUsername, usernameMessage], true);
	if (!newUsername) return;

	const pollChannel = await message.channel.send(`What Discord channel do you want to receive the livestream announcements?`);
	const newChannel = await settings.requestChannel(client, message);

	pollChannel.delete();
	if (!newChannel) return;

	const pollMessage = await message.channel.send(`Lastly, what's the message that you want to include with the announcement? Respond with '**NO**' if not.`);
	const newMessage = await settings.collectResponse(message);

	if (!newMessage) return pollMessage.delete();
	message.channel.bulkDelete([pollMessage, newMessage], true);

	client.settings.set(message.guild.id, newUsername, `twitch.username`);
	client.settings.set(message.guild.id, [newChannel.id], `twitch.channels`);

	if (newMessage.content !== `NO`) client.settings.set(message.guild.id, [newMessage.content], `twitch.messages`);
	else client.settings.set(message.guild.id, [], `twitch.messages`);

	client.settings.set(message.guild.id, true, `twitch.enabled`);

	return message.channel.send(`**Perfect**. You'll now receive Twitch livestream announcements for that streamer! You can add more channels and messages through the \`!settings\` command.`).then((msg) => msg.delete({ timeout: 5000 }));
}

async function welcomeMessageSetup (client, message) {
	const pollWelcome = await message.channel.send(`As part of the **Welcome Message** feature, would you like to send out a message when someone **joins** the Discord? Respond with '**Yes**' or '**No**'.`);
	const welcomeMessage = await settings.collectResponse(message);

	if (!welcomeMessage) return pollWelcome.delete();
	message.channel.bulkDelete([pollWelcome, welcomeMessage], true);

	switch (welcomeMessage.content) {
		case `Yes`: {
			const pollChannel = await message.channel.send(`What is the channel you'd like to have them sent to?`);
			const newChannel = await settings.requestChannel(client, message);

			pollChannel.delete();
			if (!newChannel) return;

			client.settings.set(message.guild.id, [newChannel.id], `welcomeMessage.welcome.channels`);
			client.settings.set(message.guild.id, true, `welcomeMessage.welcome.enabled`);

			message.channel.send(`**Perfect**. Welcome messages are now sent whenever a new member joins. You can add more channels and messages through the \`!settings\` command.`).then((msg) => msg.delete({ timeout: 5000 }));
		}

		case `No`: break;

		default: return message.channel.send(`**Oh no**! You didn't respond with either 'Yes' or 'No'! Try again!`);
	}

	const pollLeave = await message.channel.send(`In addition, would you like to send out a message when someone **leaves** the Discord? Respond with '**Yes**' or '**No**'.`);
	const leaveMessage = await settings.collectResponse(message);

	if (!leaveMessage) return pollLeave.delete();
	message.channel.bulkDelete([pollLeave, leaveMessage], true);

	switch (leaveMessage.content) {
		case `Yes`: {
			const pollChannel = await message.channel.send(`What is the channel you'd like to have them sent to?`);
			const newChannel = await settings.requestChannel(client, message);

			pollChannel.delete();
			if (!newChannel) return;

			client.settings.set(message.guild.id, [newChannel.id], `welcomeMessage.leave.channels`);
			client.settings.set(message.guild.id, true, `welcomeMessage.leave.enabled`);

			return message.channel.send(`**Perfect**. Leave messages are now sent whenever a member leaves. You can add more channels and messages through the \`!settings\` command.`).then((msg) => msg.delete({ timeout: 5000 }));
		}

		case `No`: break;

		default: return message.channel.send(`**Oh no**! You didn't respond with either 'Yes' or 'No'! Try again!`);
	}

	return message.channel.send(`**All done**! You've completed the setup for this feature.`).then((msg) => msg.delete({ timeout: 3500 }));
}

async function youtubeSetup (client, message) {
	const pollUsername = await message.channel.send(`Let's get you some YouTube subs! First up, what is the **URL** to the YouTube channel? Formatting example: \`https://www.youtube.com/channel/UCBn5UlccfcRilV53F3auwUA\``);
	const usernameMessage = await settings.collectResponse(message);

	if (!usernameMessage) return pollUsername.delete();
	const newUsername = await validateYouTubeChannel(client, message, usernameMessage.content);

	message.channel.bulkDelete([pollUsername, usernameMessage], true);
	if (!newUsername) return;

	const pollChannel = await message.channel.send(`In what channel will these announcements be posted?`);
	const newChannel = await settings.requestChannel(client, message);

	pollChannel.delete();
	if (!newChannel) return;

	const pollMessage = await message.channel.send(`At last, what message do you want to attach to the announcement? Reply '**NO**' if not.`);
	const newMessage = await settings.collectResponse(message);

	if (!newMessage) return pollMessage.delete();
	message.channel.bulkDelete([pollMessage, newMessage], true);

	client.settings.set(message.guild.id, newUsername, `youtube.username`);
	client.settings.set(message.guild.id, [newChannel.id], `youtube.channels`);

	if (newMessage.content !== `NO`) client.settings.set(message.guild.id, [newMessage.content], `youtube.messages`);
	else client.settings.set(message.guild.id, [], `youtube.messages`);

	client.settings.set(message.guild.id, true, `youtube.enabled`);

	return message.channel.send(`**Perfect**. You'll now receive YouTube video announcements for that channel! You can add more channels and messages through the \`!settings\` command.`).then((msg) => msg.delete({ timeout: 5000 }));
}
