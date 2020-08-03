const { successful, invalidArgument, invalidRange } = require(`../shared/messages.js`);

module.exports = {
	name: `slowmode`,
	aliases: [`slow`],
	description: `A command that turns on/off slowmode for the current channel`,
	memberPermissions: [`MANAGE_CHANNELS`],
	guildPermissions: [],
	channelPermissions: [`MANAGE_CHANNELS`],
	args: `[number]`,
	execute
}


async function execute (ignore, message, args) {
	const numberOfSeconds = parseInt(args[0]);

	if (isNaN(numberOfSeconds)) return invalidArgument(message.channel, `number`);
	if (numberOfSeconds < 0 || numberOfSeconds > 21600) return invalidRange(message.channel, 0, 21600);

	await message.channel.setRateLimitPerUser(numberOfSeconds);
	return successful(message.channel);
}
