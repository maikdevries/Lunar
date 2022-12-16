const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { success, invalidRange } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [PermissionFlagsBits.ManageMessages],
	guildPermissions: [],
	channelPermissions: [PermissionFlagsBits.ManageMessages],
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Delete a number of messages or a member their messages')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('messages')
				.setDescription('Delete a number of messages')
				.addIntegerOption((option) => option.setName('number').setDescription('Number of messages').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('member')
				.setDescription('Delete a member their messages')
				.addUserOption((option) => option.setName('member').setDescription('Member to delete messages of').setRequired(true))
		),
	execute
}

async function execute (interaction) {
	const member = interaction.options.getMember('member') ?? false;
	const numberOfMessages = interaction.options.getInteger('number') ?? 100;

	if (numberOfMessages < 1 || numberOfMessages > 100) return await interaction.reply({ content: invalidRange(1, 100), ephemeral: true });

	let messages = await interaction.channel.messages.fetch({ limit: numberOfMessages });

	if (member) messages = messages.filter((message) => message.member.id === member.id);

	await interaction.channel.bulkDelete(messages, true);
	return await interaction.reply({ content: success(), ephemeral: true });
}
