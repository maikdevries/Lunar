const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'messageReactionAdd' and 'messageReactionRemove' events`,
	roleAdd,
	roleRemove
};


// Dynamically adds the role(s) of the emoji reaction added to the message specified in 'config.json'
function roleAdd (client, reaction, user) {
	if (!config.reactionRole.enabled || typeof config.reactionRole.messages[reaction.message.id] === 'undefined' || config.reactionRole.messages[reaction.message.id] === null) return;

	const botMember = reaction.message.guild.members.cache.get(client.user.id);
	if (!botMember.hasPermission('MANAGE_ROLES')) return console.error(`Missing permissions (MANAGE_ROLES) to add reaction role in ${reaction.message.channel.name}!`);

	const roles = config.reactionRole.messages[reaction.message.id][reaction.emoji.id || reaction.emoji.name];
	const member = reaction.message.guild.members.cache.get(user.id);

	if (roles) member.roles.add(roles).catch((error) => console.error(`Cannot add roles, ${error}`));
}

// Dynamically removes the role(s) of the emoji reaction removed from the message specified in 'config.json'
function roleRemove (client, reaction, user) {
	if (!config.reactionRole.enabled || typeof config.reactionRole.messages[reaction.message.id] === 'undefined' || config.reactionRole.messages[reaction.message.id] === null) return;

	const botMember = reaction.message.guild.members.cache.get(client.user.id);
	if (!botMember.hasPermission('MANAGE_ROLES')) return console.error(`Missing permissions (MANAGE_ROLES) to remove reaction role in ${reaction.message.channel.name}!`);

	const roles = config.reactionRole.messages[reaction.message.id][reaction.emoji.id || reaction.emoji.name];
	const member = reaction.message.guild.members.cache.get(user.id);

	if (roles) member.roles.remove(roles).catch((error) => console.error(`Cannot remove roles, ${error}`));
}
