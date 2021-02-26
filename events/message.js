const commandHandler = require(`../features/commandHandler.js`);

module.exports = {
	name: `message`,
	once: false,
	execute(client, message) {
		commandHandler.execute(client, message);
	}
};
