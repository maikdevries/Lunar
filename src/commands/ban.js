const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { memberSamePermissions, success } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [Permissions.FLAGS.BAN_MEMBERS],
	guildPermissions: [Permissions.FLAGS.BAN_MEMBERS],
	channelPermissions: [],
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member from the server')
		.addUserOption((option) => option.setName('member').setDescription('Member to be banned').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Reason for the ban')),
	execute
}

async function execute (interaction) {
	const member = interaction.options.getMember('member');
	if (member.permissions.has(this.memberPermissions.concat([Permissions.FLAGS.KICK_MEMBERS]))) return await interaction.reply({ content: memberSamePermissions(), ephemeral: true });

	const reason = interaction.options.getString('reason');

	await member.ban({ days: 0, reason: reason });
	return await interaction.reply({ content: success(), ephemeral: true});
}
