module.exports = {
	name: 'invite',
	description: 'A command to generate an invite link to the current channel',
	usage: '!invite',
	aliases: [],

	execute
};

function execute (ignore, message, ignored) {
	if (!message.member.hasPermission('CREATE_INSTANT_INVITE')) return message.channel.send(`**Golly**, you don't have the right permissions to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	message.channel.createInvite({ maxUses: 0, unique: true, reason: `Created for ${message.author.username} by the invite command` })
		.then((invite) => {
			message.delete();
			return message.channel.send(`**Great**! You can now invite all of your friends by using ${invite} for the next 24 hours.`);
		})
		.catch((error) => console.error(`An error occurred when creating an invite, ${error}`));
}
