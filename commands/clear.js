const { successful, invalidArgument, invalidRange } = require(`../shared/messages.js`);

module.exports = {
	name: `clear`,
	aliases: [`purge`, `remove`, `delete`],
	description: `A command to clear a given number of messages in a channel`,
	memberPermissions: [`MANAGE_MESSAGES`],
	guildPermissions: [],
	channelPermissions: [`MANAGE_MESSAGES`],
	args: `[number]/@[member]`,
	execute
}


async function execute (ignore, message, args) {
	const userToPurge = parseInt(args[0]) ? false : message.mentions.users?.first();
	let numberOfMessages = userToPurge ? 99 : parseInt(args[0]);

	if (isNaN(numberOfMessages)) return invalidArgument(message.channel, `number`);
	if (numberOfMessages < 1 || numberOfMessages > 99) return invalidRange(message.channel, 1, 99);

	let messages = await message.channel.messages.fetch({ limit: numberOfMessages + 1 });

	if (userToPurge) messages = messages.filter((msg) => msg.author.id === userToPurge.id);
	else messages = messages.filter((msg) => msg.id !== message.id);

	await message.channel.bulkDelete(messages, true);
	return successful(message.channel);
}
