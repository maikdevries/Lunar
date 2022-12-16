const { PermissionFlagsBits, ActivityType } = require('discord.js');
const { checkGuildPermissions, checkRolePosition } = require('../shared/functions.js');

module.exports = {
	description: 'Assigns a Discord role to members that are currently livestreaming',
	execute
}

async function execute (client, newPresence) {
	const guildSettings = await client.settings.get(`${newPresence.guild.id}.streamerShoutout`);

	if (!guildSettings.enabled || !await checkGuildPermissions(client, newPresence.guild, [PermissionFlagsBits.ManageRoles]) || !checkRolePosition(client, newPresence.guild, guildSettings.shoutoutRole)) return;

	if (guildSettings.requiredRole && !newPresence.member?.roles.cache.hasAny(guildSettings.requiredRole)) return newPresence.member?.roles.remove(guildSettings.shoutoutRole);

	if (newPresence.activities.some((activity) => activity.type === ActivityType.Streaming)) return newPresence.member?.roles.add(guildSettings.shoutoutRole);
	return newPresence.member?.roles.remove(guildSettings.shoutoutRole);
}
