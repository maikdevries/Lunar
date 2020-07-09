const { guildPermissionsCheck } = require('./../shared/permissionCheck.js');

module.exports = {
	description: `Handles both the 'messageReactionAdd' and 'messageReactionRemove' events`,
	roleAdd,
	roleRemove
};


// Dynamically adds the role(s) of the emoji reaction added to the message specified in 'config.json'
async function roleAdd (client, reaction, user) {
	if (reaction.partial) await reaction.fetch().catch((error) => console.error(`An error occurred fetching the partial reaction message, ${error}`));

	const guildSettings = client.settings.get(reaction.message.guild.id, 'reactionRole');

	if (!guildSettings.enabled || typeof guildSettings.messages[reaction.message.id] === 'undefined' || guildSettings.messages[reaction.message.id] === null) return;

	if (!guildPermissionsCheck(client, reaction.message.guild, ['MANAGE_ROLES'])) return console.error(`Missing permissions (MANAGE_ROLES) to add reaction role in ${reaction.message.channel.name}!`);

	const roles = guildSettings.messages[reaction.message.id][reaction.emoji.id || reaction.emoji.name];
	const member = reaction.message.guild.members.cache.get(user.id);

	if (roles) member.roles.add(roles).catch((error) => console.error(`Cannot add roles, ${error}`));
}

// Dynamically removes the role(s) of the emoji reaction removed from the message specified in 'config.json'
async function roleRemove (client, reaction, user) {
	if (reaction.partial) await reaction.fetch().catch((error) => console.error(`An error occurred fetching the partial reaction message, ${error}`));

	const guildSettings = client.settings.get(reaction.message.guild.id, 'reactionRole');

	if (!guildSettings.enabled || typeof guildSettings.messages[reaction.message.id] === 'undefined' || guildSettings.messages[reaction.message.id] === null) return;

	if (!guildPermissionsCheck(client, reaction.message.guild, ['MANAGE_ROLES'])) return console.error(`Missing permissions (MANAGE_ROLES) to add reaction role in ${reaction.message.channel.name}!`);

	const roles = guildSettings.messages[reaction.message.id][reaction.emoji.id || reaction.emoji.name];
	const member = reaction.message.guild.members.cache.get(user.id);

	if (roles) member.roles.remove(roles).catch((error) => console.error(`Cannot remove roles, ${error}`));
}
