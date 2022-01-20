const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { memberSamePermissions, success } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [Permissions.FLAGS.KICK_MEMBERS],
	guildPermissions: [Permissions.FLAGS.KICK_MEMBERS],
	channelPermissions: [],
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a member from the server')
		.addUserOption((option) => option.setName('member').setDescription('Member to be kicked').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Reason for kicking')),
	execute
}

async function execute (interaction) {
	const member = interaction.options.getMember('member');
	if (member.permissions.has(this.memberPermissions.concat([Permissions.FLAGS.BAN_MEMBERS]))) return await interaction.reply({ content: memberSamePermissions(), ephemeral: true });

	const reason = interaction.options.getString('reason');

	await member.kick(reason);
	return await interaction.reply({ content: success(), ephemeral: true });
}
