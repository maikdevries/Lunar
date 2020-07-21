module.exports = {
	name: `slowmode`,
	aliases: [`slow`],
	description: `A command that turns on/off slowmode for the current channel`,
	memberPermissions: [`MANAGE_CHANNELS`],
	guildPermissions: [],
	channelPermissions: [`MANAGE_CHANNELS`],
	args: true,
	usage: `[PREFIX]slowmode [number]`,
	execute
}


async function execute (ignore, message, args) {
	const numberOfSeconds = parseInt(args[0]);
	if (isNaN(numberOfSeconds)) return message.channel.send(`**Ah**, that doesn't seem to be a number. Please try again!`).then((msg) => msg.delete({ timeout: 3500 }));

	try {
		await message.channel.setRateLimitPerUser(numberOfSeconds);
		if (numberOfSeconds > 0) return message.channel.send(`**Done**! I turned on slowmode for this channel and set it to ${numberOfSeconds} seconds.`).then((msg) => msg.delete({ timeout: 3500 }));
		return message.channel.send(`**Done**! I turned off slowmode for this channel.`).then((msg) => msg.delete({ timeout: 3500 }));
	} catch (error) {
		console.error(`Something went wrong when setting slowmode: ${error}`);
		return message.channel.send(`**Awww**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	}
}
