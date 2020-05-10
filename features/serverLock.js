const config = require('./../config.json');


module.exports = {
	description: `Handles both the 'memberLock' and 'memberUnlock' of the serverLock feature`,
	memberLock,
	memberUnlock
};


// Adds the role that locks the new member out of the server
function memberLock (member) {
	if (!config.serverLock.enabled) return;

	const { role } = config.serverLock;
	if (role) member.roles.add(role).catch((error) => console.error(`Cannot add 'memberLock' role, ${error}`));
}

// Removes the role that locks the member out of the server
function memberUnlock (reaction, user) {
	if (!config.serverLock.enabled || config.serverLock.manual) return;

	const emojiKey = reaction.emoji.id || reaction.emoji.name;
	if (config.serverLock.message[reaction.message.id] !== emojiKey) return;

	const { role } = config.serverLock;
	const member = reaction.message.guild.members.cache.get(user.id);

	if (role) member.roles.remove(role).catch((error) => console.error(`Cannot remove 'memberLock' role, ${error}`));
}
