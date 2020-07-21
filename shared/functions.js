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

function rolePositionCheck (client, guild, roleID) {
	const botMember = guild.members.cache.get(client.user.id);
	const clientRole = guild.roles.cache.find((role) => role.managed && role.members.every((member) => member.id === botMember.id));

	return clientRole.comparePositionTo(roleID) > 0;
}
