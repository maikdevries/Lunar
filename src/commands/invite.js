const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { inviteCreated } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [Permissions.FLAGS.CREATE_INSTANT_INVITE],
	guildPermissions: [],
	channelPermissions: [Permissions.FLAGS.CREATE_INSTANT_INVITE],
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Create an invite link to the current channel'),
	execute
}

async function execute (interaction) {
	const invite = await interaction.channel.createInvite({ unique: true, reason: `Created for ${interaction.user.username} through the invite command` });
	return await interaction.reply({ content: inviteCreated(invite), ephemeral: true });
}
