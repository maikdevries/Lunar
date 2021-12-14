const streamStatus = require('../features/streamStatus.js');

module.exports = {
	name: 'presenceUpdate',
	once: false,
	execute
}

async function execute (client, oldPresence, newPresence) {
	await streamStatus.execute(client, newPresence);
}
