module.exports = {
	name: `ask`,
	aliases: [`8ball`],
	description: `A command that randomly answers the question it is asked`,
	permissions: [],
	args: true,
	usage: `[PREFIX]ask [question]?`,
	execute
}


async function execute (client, message, args) {
	if (!args[args.length - 1].endsWith(`?`)) return message.channel.send(`**Hmmm**, you forgot to ask a question!`).then((msg) => msg.delete({ timeout: 3500 }));

	const { messages } = client.settings.get(message.guild.id, `commands.ask`);
	return message.channel.send(`> ${message.member}: ${args.join(` `)}\n${messages[Math.floor(Math.random() * messages.length)]}`, { disableMentions: 'everyone' });
}
