const streamerShoutout = require('../features/streamerShoutout.js');

module.exports = {
	name: 'presenceUpdate',
	once: false,
	execute
}

async function execute (client, oldPresence, newPresence) {
	await streamerShoutout.execute(client, newPresence);
}
