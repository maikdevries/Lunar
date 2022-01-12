module.exports = {
	description: 'A collection of functions used throughout the codebase',
	checkGuildPermissions, checkChannelPermissions, checkRolePosition
}

async function checkGuildPermissions (client, guild, permissions) {
	try { return (await guild.members.fetch(client.user.id)).permissions.has(permissions) }
	catch { return false }
}

function checkChannelPermissions (client, channel, permissions) {
	return (channel.permissionsFor(client.user))?.has(permissions);
}

function checkRolePosition (client, guild, roleID) {
	return guild.roles.botRoleFor(client.user)?.comparePositionTo(roleID) > 0;
}
