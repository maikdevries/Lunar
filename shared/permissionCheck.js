module.exports = {
	description: 'A module that offers dynamic Discord permission checks',
	channelPermissionsCheck,
	guildPermissionsCheck
};


// Checks if given client has given permissions in the given channel
function channelPermissionsCheck (client, channel, permissions) {
	const botMember = channel.guild.members.cache.get(client.user.id);
	const channelPermissions = channel.permissionsFor(botMember);

	return permissions.every((permission) => channelPermissions.has(permission));
}

// Checks if given client has given permissions in the given guild
function guildPermissionsCheck (client, guild, permissions) {
	const botMember = guild.members.cache.get(client.user.id);

	return permissions.every((permission) => botMember.hasPermission(permission));
}
