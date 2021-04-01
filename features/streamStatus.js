const { missingGuildPermissions, rolePositionCheck } = require(`../shared/functions.js`);

module.exports = {
	description: `Adds a shoutout Discord role to currently streaming members`,
	setStatus
};


async function setStatus (client, ignore, newPresence) {
	const guildSettings = await client.settings.get(`${newPresence.guild.id}.streamStatus`);

	if (!guildSettings?.enabled) return;
	if (!guildSettings.statusRole) return console.error(`Cannot manage shoutout role for livestreaming members, setup not complete for guild: ${newPresence.guild.id}!`);

	if (await missingGuildPermissions(client, null, newPresence.guild, [`MANAGE_ROLES`])) return console.error(`Missing permissions (MANAGE_ROLES) to add shoutout livestreaming role for guild: ${newPresence.guild.id}!`);
	if (!await rolePositionCheck(client, newPresence.guild, guildSettings.statusRole)) return console.error(`Client role lower than role for stream status for guild: ${newPresence.guild.id}`);

	if (guildSettings.streamerRole && !newPresence.member?.roles.cache.has(guildSettings.streamerRole)) return newPresence.member.roles.remove(guildSettings.statusRole).catch((error) => console.error(`Something went wrong, cannot remove shoutout livestreaming role for guild: ${newPresence.guild.id}, ${error}`));

	if (newPresence.activities.some((activity) => activity.type === `STREAMING`)) return newPresence.member?.roles.add(guildSettings.statusRole).catch((error) => console.error(`Something went wrong, cannot add shoutout livestreaming role for guild: ${newPresence.guild.id}, ${error}`));
	return newPresence.member?.roles.remove(guildSettings.statusRole).catch((error) => console.error(`Something went wrong, cannot remove shoutout livestreaming role for guild: ${newPresence.guild.id}, ${error}`));
}
