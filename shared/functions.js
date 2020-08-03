const { clientMissingPermissions } = require(`./messages.js`);

module.exports = {
	description: `A collection of shared functions used throughout the code base`,
	missingChannelPermissions, missingGuildPermissions,
	rolePositionCheck
}


async function missingChannelPermissions (client, message, channel, permissions) {
	const botMember = channel.guild.members.cache.get(client.user.id);
	const channelPermissions = channel.permissionsFor(botMember);

	const missingPermissions = [];
	for (const permission in permissions) if (!channelPermissions.has(permission)) missingPermissions.push(permission);

	if (missingPermissions.length) {
		if (message) clientMissingPermissions(message.channel, missingPermissions);
		return true;
	}

	return false;
}

async function missingGuildPermissions (client, message, guild, permissions) {
	const botMember = guild.members.cache.get(client.user.id);

	const missingPermissions = [];
	for (const permission in permissions) if (!botMember.hasPermission(permission)) missingPermissions.push(permission);

	if (missingPermissions.length) {
		if (message) clientMissingPermissions(message.channel, missingPermissions);
		return true;
	}

	return false;
}

async function rolePositionCheck (client, guild, roleID) {
	const botMember = guild.members.cache.get(client.user.id);
	const clientRole = guild.roles.cache.find((role) => role.managed && role.members.size && role.members.every((member) => member.id === botMember.id));

	return clientRole.comparePositionTo(roleID) > 0;
}
