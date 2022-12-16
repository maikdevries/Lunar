const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { inviteCreated } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [PermissionFlagsBits.CreateInstantInvite],
	guildPermissions: [],
	channelPermissions: [PermissionFlagsBits.CreateInstantInvite],
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Create an invite link to the current channel'),
	execute
}

async function execute (interaction) {
	const invite = await interaction.channel.createInvite({ unique: true, reason: `Created for ${interaction.user.username} through the invite command` });
	return await interaction.reply({ content: inviteCreated(invite), ephemeral: true });
}
