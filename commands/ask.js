module.exports = {
	name: `ask`,
	aliases: [`8ball`],
	description: `A command that randomly answers the question it is asked`,
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	args: `[question]`,
	execute
}


async function execute (client, message, args) {
	const messages = await client.settings.get(`${message.guild.id}.commands.ask.messages`);
	return message.channel.send(`> ${message.member}: ${args.join(` `)}\n${messages[Math.floor(Math.random() * messages.length)]}`, { disableMentions: 'everyone' });
}
