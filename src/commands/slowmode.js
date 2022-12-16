const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { success, invalidRange } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [PermissionFlagsBits.ManageChannels],
	guildPermissions: [],
	channelPermissions: [PermissionFlagsBits.ManageChannels],
	data: new SlashCommandBuilder()
		.setName('slowmode')
		.setDescription('Change the minimum waiting period between messages from the same person')
		.addIntegerOption((option) => option.setName('seconds').setDescription('Time in seconds with 0 to disable').setRequired(true)),
	execute
}

async function execute (interaction) {
	const seconds = interaction.options.getInteger('seconds');

	if (seconds < 0 || seconds > 21600) return await interaction.reply({ content: invalidRange(0, 21600), ephemeral: true });

	await interaction.channel.setRateLimitPerUser(seconds);
	return await interaction.reply({ content: success(), ephemeral: true });
}
