const { channelPermissionsCheck } = require(`./../shared/permissionCheck.js`);

module.exports = {
	name: `invite`,
	aliases: [`link`],
	description: `A command to generate an invite link to the current channel`,
	args: false,
	usage: `[PREFIX]invite`,
	execute
}


function execute (client, message, ignored) {
	if (!message.member.hasPermission(`CREATE_INSTANT_INVITE`)) return message.channel.send(`**Golly**, you don't have the right permissions to do this!`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!channelPermissionsCheck(client, message.channel, [`CREATE_INSTANT_INVITE`])) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));

	message.channel.createInvite({ maxUses: 0, unique: true, reason: `Created for ${message.author.username} through the invite command` })
		.then((invite) => message.channel.send(`**Great**! You can now invite all of your friends through ${invite} for the next 24 hours.`))
		.catch((error) => console.error(`Something went wrong when creating a channel invite: ${error}`));
}
