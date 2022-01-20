const { Permissions } = require('discord.js');
const { checkGuildPermissions, checkRolePosition } = require('../shared/functions.js');

module.exports = {
	description: 'Manages role assignment based on message reactions',
	execute
}

async function execute (client, messageReaction, user, action) {
	try { if (messageReaction.partial) messageReaction = await messageReaction.fetch() }
	catch { return }

	const guildSettings = await client.settings.get(`${messageReaction.message.guild.id}.reactionRole`);
	if (!guildSettings.enabled) return;

	const roles = guildSettings.messages[messageReaction.message.id]?.[messageReaction.emoji.id || messageReaction.emoji.name];
	if (!roles) return;

	if (!await checkGuildPermissions(client, messageReaction.message.guild, [Permissions.FLAGS.MANAGE_ROLES])) return;

	let member;
	try { member = await messageReaction.message.guild.members.fetch(user.id) }
	catch { return }

	for (const role of roles) {
		if (!checkRolePosition(client, messageReaction.message.guild, role)) continue;

		if (action === 'ADD') await member.roles.add(role);
		else await member.roles.remove(role);
	}
}
