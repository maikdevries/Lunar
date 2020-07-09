const { guildPermissionsCheck } = require('./../shared/permissionCheck.js');


module.exports = {
	description: `Handles both the 'memberLock' and 'memberUnlock' of the serverLock feature`,
	memberLock,
	memberUnlock
};


// Adds the role that locks the new member out of the server
function memberLock (client, member) {
	const guildSettings = client.settings.get(member.guild.id, 'serverLock');

	if (!guildSettings.enabled) return;

	if (!guildPermissionsCheck(client, member.guild, ['MANAGE_ROLES'])) return console.error(`Missing permissions (MANAGE_ROLES) to add server lock to ${member.nickname}!`);

	const { role } = guildSettings;
	if (role) member.roles.add(role).catch((error) => console.error(`Cannot add 'memberLock' role, ${error}`));
}

// Removes the role that locks the member out of the server
function memberUnlock (client, reaction, user) {
	const guildSettings = client.settings.get(reaction.message.guild.id, 'serverLock');

	if (!guildSettings.enabled) return;

	if (!guildPermissionsCheck(client, reaction.message.guild, ['MANAGE_ROLES'])) return console.error(`Missing permissions (MANAGE_ROLES) to remove server lock from ${user.username}!`);

	const emojiKey = reaction.emoji.id || reaction.emoji.name;
	if (guildSettings.message[reaction.message.id] !== emojiKey) return;

	const { role } = guildSettings;
	const member = reaction.message.guild.members.cache.get(user.id);

	if (role) member.roles.remove(role).catch((error) => console.error(`Cannot remove 'memberLock' role, ${error}`));
}
