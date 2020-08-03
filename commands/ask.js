module.exports = {
	name: `ask`,
	aliases: [`8ball`],
	description: `A command that randomly answers the question it is asked`,
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	args: false,
	execute
}


async function execute (client, message, args) {
	const { messages } = client.settings.get(message.guild.id, `commands.ask`);
	return message.channel.send(`> ${message.member}: ${args.join(` `)}\n${messages[Math.floor(Math.random() * messages.length)]}`, { disableMentions: 'everyone' });
}
