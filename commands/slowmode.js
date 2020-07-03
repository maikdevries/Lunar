const { commandPrefix } = require('./../config.json');

const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');

module.exports = {
	name: 'slowmode',
	aliases: ['slow'],
	description: 'A command that turns on/off slowmode for the current channel',
	args: true,
	usage: `${commandPrefix}slowmode [number]`,

	execute
};

function execute (client, message, args) {
	if (!message.member.hasPermission('MANAGE_CHANNELS')) return message.channel.send(`**Golly**! You don't have the right permissions to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	if (!channelPermissionsCheck(client, message.channel, ['MANAGE_CHANNELS'])) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));

	const numberOfSeconds = parseInt(args[0]);
	if (isNaN(numberOfSeconds)) return message.channel.send(`**Ah**, that doesn't seem to be a number. Please try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	message.channel.setRateLimitPerUser(numberOfSeconds).then(() => {
		if (numberOfSeconds > 0) return message.channel.send(`**Done**! I turned on slowmode for this channel and set it to ${numberOfSeconds} seconds.`).then((msg) => msg.delete({ timeout: 3500 }));
		return message.channel.send(`**Done**! I turned off slowmode for this channel.`).then((msg) => msg.delete({ timeout: 3500 }));
	}).catch((error) => {
		console.error(`An error occurred when setting slowmode, ${error}`);
		message.channel.send(`**Awww**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	});
}
