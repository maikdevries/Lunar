module.exports = {
	name: `invite`,
	aliases: [`link`],
	description: `A command to generate an invite link to the current channel`,
	memberPermissions: [`CREATE_INSTANT_INVITE`],
	guildPermissions: [],
	channelPermissions: [`CREATE_INSTANT_INVITE`],
	args: false,
	usage: `[PREFIX]invite`,
	execute
}


async function execute (ignore, message, ignored) {
	try {
		const invite = await message.channel.createInvite({ maxUses: 0, unique: true, reason: `Created for ${message.author.username} through the invite command` });
		return message.channel.send(`**Great**! You can now invite all of your friends through ${invite} for the next 24 hours.`);
	} catch (error) {
		console.error(`Something went wrong when creating a channel invite: ${error}`);
		return message.channel.send(`**Oh no**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	}
}
