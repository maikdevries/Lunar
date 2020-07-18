module.exports = {
	name: `clear`,
	aliases: [`purge`, `remove`, `delete`],
	description: `A command to clear a given number of messages in a channel`,
	permissions: [`MANAGE_MESSAGES`],
	args: true,
	usage: `[PREFIX]clear [number]/@[user]`,
	execute
}


async function execute (ignore, message, args) {
	const userToPurge = parseInt(args[0]) ? false : message.mentions.users.first();
	let numberOfMessages = userToPurge ? 99 : parseInt(args[0]);

	if (isNaN(numberOfMessages)) return message.channel.send(`**Oops**! That doesn't seem to be a number! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (numberOfMessages < 1 || numberOfMessages > 99) return message.channel.send(`**Oops**! That doesn't seem to work! Please try again with a number between 1 and 99!`).then((msg) => msg.delete({ timeout: 3500 }));

	try {
		const messages = await message.channel.messages.fetch({ limit: numberOfMessages + 1 });

		if (userToPurge) {
			var filteredMessages = messages.filter((msg) => msg.author.id === userToPurge.id);
			numberOfMessages = filteredMessages.length;
		}

		await message.channel.bulkDelete(filteredMessages || messages, true);
		return message.channel.send(`**Yay**! I successfully cleared ${numberOfMessages} message(s) for you!`).then((msg) => msg.delete({ timeout: 3500 }));
	} catch (error) {
		console.error(`Something went wrong when clearing messages: ${error}`);
		return message.channel.send(`**Oh no**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	}
}
