const config = require('./../config.json');

const { guildPermissionsCheck } = require('./../shared/permissionCheck.js');

module.exports = {
	description: `Manages the 'Currently Livestreaming' role functionality`,
	setStatus
};


// Adds 'Currently Livestreaming' role to streamers that are streaming and removes it when they stop streaming
function setStatus (client, ignore, newPresence) {
	if (!config.streamStatus.enabled) return;

	const { streamerRole, streamStatusRole } = config.streamStatus;
	if (!streamStatusRole) return console.error(`Stream status role is not set in the configuration options!`);

	if (streamerRole && !newPresence.member.roles.cache.has(streamerRole)) return;

	if (!guildPermissionsCheck(client, newPresence.guild, ['MANAGE_ROLES'])) return console.error(`Missing permissions (MANAGE_ROLES) to change stream status role for ${newPresence.member.nickname}!`);

	if (newPresence.activities.some((activity) => activity.type === 'STREAMING')) return newPresence.member.roles.add(streamStatusRole).catch((error) => console.error(`Cannot add streamer status role, ${error}`));

	if (newPresence.member.roles.cache.has(streamStatusRole)) return newPresence.member.roles.remove(streamStatusRole).catch((error) => console.error(`Cannot remove streamer status role, ${error}`));
}
