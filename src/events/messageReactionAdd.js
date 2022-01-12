const reactionRole = require('../features/reactionRole.js');

module.exports = {
	name: 'messageReactionAdd',
	once: false,
	execute
}

async function execute (client, messageReaction, user) {
	await reactionRole.execute(client, messageReaction, user, 'ADD');
}
