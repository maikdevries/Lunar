module.exports = {
	description: `A module that offers dynamic Discord permission checks based on passed array of permissions`,
	channelPermissionsCheck,
	guildPermissionsCheck
};


function channelPermissionsCheck (client, channel, permissions) {
	const botMember = channel.guild.members.cache.get(client.user.id);

	const channelPermissions = channel.permissionsFor(botMember);
	return permissions.every((permission) => channelPermissions.has(permission));
}

function guildPermissionsCheck (client, guild, permissions) {
	const botMember = guild.members.cache.get(client.user.id);
	return permissions.every((permission) => botMember.hasPermission(permission));
}
