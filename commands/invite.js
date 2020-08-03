module.exports = {
	name: `invite`,
	aliases: [`link`],
	description: `A command to generate an invite link to the current channel`,
	memberPermissions: [`CREATE_INSTANT_INVITE`],
	guildPermissions: [],
	channelPermissions: [`CREATE_INSTANT_INVITE`],
	args: false,
	execute
}


async function execute (ignore, message, ignored) {
	const invite = await message.channel.createInvite({ maxUses: 0, unique: true, reason: `Created for ${message.author.username} through the invite command` });
	return message.channel.send(`**Great**! You can now invite all of your friends through ${invite} for the next 24 hours.`);
}
