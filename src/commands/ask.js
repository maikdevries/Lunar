const { SlashCommandBuilder } = require('discord.js');

const messages = ['The answer is yes.', 'Yep, that is true.', 'You can be certain.', 'Without a doubt.', 'Yes.', 'You are not wrong.', 'Sure thing.', 'I would not advise against it.',
	'There is a chance.', 'Uhh, I guess?', 'The stars are aligned.', 'No.', 'My answer is no.', 'Nah, that is where you are wrong.', 'Most certainly not.', 'Definitely not.',
	'Do not think so.', 'I would not follow through.', 'This will result in failure.', 'Regrets are awaiting you.', 'The outlook is not good.', 'I do not have an answer for you.',
	'*Starts sweating...*', 'I have forgotten the answer.', 'That is a difficult question to answer.', 'I do not possess the knowledge to answer this.', 'Brainfart.', 'Uhh...'];

module.exports = {
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Give a random answer to the question asked')
		.addStringOption((option) => option.setName('question').setDescription('The question that needs to be answered').setRequired(true)),
	execute
}

async function execute (interaction) {
	const question = interaction.options.getString('question');
	return await interaction.reply({ content: `**Q** ${question}\n**A** ${messages[Math.floor(Math.random() * messages.length)]}` });
}
