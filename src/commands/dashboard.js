const { SlashCommandBuilder } = require('discord.js');
const { dashboard } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	data: new SlashCommandBuilder()
		.setName('dashboard')
		.setDescription('Launch into Orbit and manage Lunar\'s behaviour'),
	execute
}

async function execute (interaction) {
	return await interaction.reply({ content: dashboard(), ephemeral: true });
}
