module.exports = {
	description: `A collection of shared functions used throughout the code base`,
	channelPermissionsCheck, guildPermissionsCheck,
	rolePositionCheck
}


function channelPermissionsCheck (client, channel, permissions) {
	const botMember = channel.guild.members.cache.get(client.user.id);

	const channelPermissions = channel.permissionsFor(botMember);
	return permissions.every((permission) => channelPermissions.has(permission));
}

function guildPermissionsCheck (client, guild, permissions) {
	const botMember = guild.members.cache.get(client.user.id);
	return permissions.every((permission) => botMember.hasPermission(permission));
}

function rolePositionCheck (client, guildID, roleID) {
	clientRole = client.guilds.cache.get(guildID).roles.cache.find((role) => role.managed && role.client === client);
	return clientRole.comparePositionTo(roleID) > 0;
}
