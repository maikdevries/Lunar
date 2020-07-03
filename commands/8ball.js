const config = require('./../config.json');

module.exports = {
	name: '8ball',
	aliases: ['ask'],
	description: 'A command that randomly answers the question it is asked',
	args: true,
	usage: `${config.commandPrefix}8ball [question]?`,

	execute
};

function execute (ignore, message, args) {
	if (!args[args.length - 1].endsWith('?')) return message.channel.send(`**Hmmm**, you forgot to ask a question!`).then((msg) => msg.delete({ timeout: 3500 }));

	const { responses } = config.commands['8ball'];
	return message.channel.send(`> ${args.join(' ')}\n${responses[Math.floor(Math.random() * responses.length)]}`);
}
