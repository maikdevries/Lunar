const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'messageReactionAdd' and 'messageReactionRemove' events`,
	roleAdd,
	roleRemove
};


// Dynamically adds the role(s) of the emoji reaction added to the message specified in 'config.json'
function roleAdd (reaction, user) {
	if (!config.reactionRole.enabled || config.reactionRole.messages[reaction.message.id] == null) return;

	const roles = config.reactionRole.messages[reaction.message.id][reaction.emoji.id || reaction.emoji.name];
	const member = reaction.message.guild.members.find((mbr) => mbr.id === user.id);

	if (roles) member.roles.add(roles).catch((error) => console.error(`Cannot add roles, ${error}`));
}

// Dynamically removes the role(s) of the emoji reaction removed from the message specified in 'config.json'
function roleRemove (reaction, user) {
	if (!config.reactionRole.enabled || config.reactionRole.messages[reaction.message.id] == null) return;

	const roles = config.reactionRole.messages[reaction.message.id][reaction.emoji.id || reaction.emoji.name];
	const member = reaction.message.guild.members.find((mbr) => mbr.id === user.id);

	if (roles) member.roles.remove(roles).catch((error) => console.error(`Cannot remove roles, ${error}`));
}
