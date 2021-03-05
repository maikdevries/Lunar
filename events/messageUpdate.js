const commandHandler = require(`../features/commandHandler.js`);

module.exports = {
	name: `messageUpdate`,
	once: false,
	execute(client, ignore, newMessage) {
		commandHandler.execute(client, newMessage);
	}
};
