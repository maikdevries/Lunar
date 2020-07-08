module.exports = {
	name: '8ball',
	aliases: ['ask'],
	description: 'A command that randomly answers the question it is asked',
	args: true,
	usage: `[PREFIX]8ball [question]?`,

	execute
};

function execute (client, message, args) {
	if (!args[args.length - 1].endsWith('?')) return message.channel.send(`**Hmmm**, you forgot to ask a question!`).then((msg) => msg.delete({ timeout: 3500 }));

	const { messages } = client.settings.get(message.guild.id, 'commands[8ball]');
	return message.channel.send(`> ${args.join(' ')}\n${messages[Math.floor(Math.random() * messages.length)]}`);
}
