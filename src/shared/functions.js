module.exports = {
	description: 'A collection of functions used throughout the codebase',
	checkGuildPermissions, checkChannelPermissions, checkRolePosition
}

async function checkGuildPermissions (client, guild, permissions) {
	try { return (await guild.members.fetch(client.user.id))?.permissions.has(permissions) }
	catch { return false }
}

function checkChannelPermissions (client, channel, permissions) {
	return (channel.permissionsFor(client.user))?.has(permissions);
}

async function checkRolePosition (client, guild, roleID) {
	try { return (await guild.members.fetch(client.user.id))?.roles.highest.comparePositionTo(roleID) > 0 }
	catch { return false }
}
