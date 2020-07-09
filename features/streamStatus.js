const { guildPermissionsCheck } = require('./../shared/permissionCheck.js');

module.exports = {
	description: `Manages the 'Currently Livestreaming' role functionality`,
	setStatus
};


// Adds 'Currently Livestreaming' role to streamers that are streaming and removes it when they stop streaming
function setStatus (client, ignore, newPresence) {
	const guildSettings = client.settings.get(newPresence.guild.id, 'streamStatus');

	if (!guildSettings.enabled) return;

	const { streamerRole, statusRole } = guildSettings;
	if (!statusRole) return console.error(`Stream status role is not set in the configuration options!`);

	if (streamerRole && !newPresence.member.roles.cache.has(streamerRole)) return;

	if (!guildPermissionsCheck(client, newPresence.guild, ['MANAGE_ROLES'])) return console.error(`Missing permissions (MANAGE_ROLES) to change stream status role for ${newPresence.member.nickname}!`);

	if (newPresence.activities.some((activity) => activity.type === 'STREAMING')) return newPresence.member.roles.add(statusRole).catch((error) => console.error(`Cannot add streamer status role, ${error}`));

	if (newPresence.member.roles.cache.has(statusRole)) return newPresence.member.roles.remove(statusRole).catch((error) => console.error(`Cannot remove streamer status role, ${error}`));
}
