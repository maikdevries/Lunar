const streamStatus = require(`../features/streamStatus.js`);

module.exports = {
	name: `presenceUpdate`,
	once: false,
	execute(client, oldPresence, newPresence) {
		streamStatus.setStatus(client, oldPresence, newPresence);
	}
};
