const { commandPrefix } = require('./../config.json');

module.exports = {
	name: '8ball',
	description: 'A command that randomly answers the question it is asked',
	usage: `${commandPrefix}8ball [question]`,
	args: true,
	aliases: [],

	execute
};

function execute (ignore, message, args) {
	if (!args[args.length - 1].includes('?')) return message.channel.send(`**Hmmm**, you forgot to ask a question!`).then((msg) => msg.delete({ timeout: 3500 }));

	const answers = ['Yes', 'No', 'Maybe', 'Always', 'Never', 'Perhaps', 'Possibly', 'Negative', 'Affirmative', 'Nay', 'Nah', 'Yea', 'Aye', 'What?!', 'Are you out of your mind?', 'You are one crazy person'];
	const response = answers[Math.floor(Math.random() * answers.length)];

	return message.channel.send(`The magic 8-ball says: **${response}**`);
}
