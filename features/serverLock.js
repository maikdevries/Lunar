const { missingGuildPermissions, rolePositionCheck } = require(`../shared/functions.js`);

module.exports = {
	description: `Locks new members out of joined server until they unlock themselves`,
	memberLock,
	memberUnlock
};


async function memberLock (client, member) {
	const guildSettings = client.settings.get(member.guild.id, `serverLock`);

	if (!guildSettings?.enabled) return;
	if (!guildSettings.role || !guildSettings.message) return console.error(`Cannot manage server lock for guild members, setup not complete for guild: ${member.guild.id}!`);

	if (await missingGuildPermissions(client, null, member.guild, [`MANAGE_ROLES`])) return console.error(`Missing permissions (MANAGE_ROLES) to add lock role for guild: ${member.guild.id}!`);
	if (!await rolePositionCheck(client, member.guild, guildSettings.role)) return console.error(`Client role lower than role when adding server lock role for guild: ${member.guild.id}`);

	return member.roles.add(guildSettings.role).catch((error) => console.error(`Something went wrong when locking a new member: ${error}`));
}

async function memberUnlock (client, reaction, user) {
	try { if (reaction.partial) reaction = await reaction.fetch() }
	catch (error) { return console.error(`Something went wrong when fetching a partial reaction: ${error}`) }

	const guildSettings = client.settings.get(reaction.message.guild.id, `serverLock`);

	if (!guildSettings?.enabled) return;
	if (!guildSettings.role || !guildSettings.message) return console.error(`Cannot manage server lock for guild members, setup not complete for guild: ${member.guild.id}!`);

	if (await missingGuildPermissions(client, null, reaction.message.guild, [`MANAGE_ROLES`])) return console.error(`Missing permissions (MANAGE_ROLES) to remove lock role for guild: ${member.guild.id}!`);
	if (!await rolePositionCheck(client, reaction.message.guild, guildSettings.role)) return console.error(`Client role lower than role when removing server lock role for guild: ${reaction.message.guild.id}`);

	const emojiKey = reaction.emoji.id || reaction.emoji.name;
	if (guildSettings.message[reaction.message.id] !== emojiKey) return;

	const member = reaction.message.guild.members.cache.get(user.id);
	return member.roles.remove(guildSettings.role).catch((error) => console.error(`Something went wrong when unlocking a member: ${error}`));
}
