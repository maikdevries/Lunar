const { Permissions } = require('discord.js');
const { checkGuildPermissions, checkRolePosition } = require('../shared/functions.js');

module.exports = {
	description: 'Assigns a Discord role to members that are currently livestreaming',
	execute
}

async function execute (client, newPresence) {
	const guildSettings = await client.settings.get(`${newPresence.guild.id}.streamStatus`);

	if (!guildSettings.enabled || !await checkGuildPermissions(client, newPresence.guild, [Permissions.FLAGS.MANAGE_ROLES]) || !checkRolePosition(client, newPresence.guild, guildSettings.streamingRole)) return;

	if (guildSettings.requiredRole && !newPresence.member?.roles.cache.has(guildSettings.requiredRole)) return newPresence.member?.roles.remove(guildSettings.streamingRole);

	if (newPresence.activities.some((activity) => activity.type === 'STREAMING')) return newPresence.member?.roles.add(guildSettings.streamingRole);
	return newPresence.member?.roles.remove(guildSettings.streamingRole);
}
