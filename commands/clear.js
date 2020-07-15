module.exports = {
	name: `clear`,
	aliases: [`purge`, `remove`, `delete`],
	description: `A command to clear a given number of messages in a channel`,
	args: true,
	usage: `[PREFIX]clear [number]/@[user]`,
	execute
}


function execute (ignore, message, args) {
	if (!message.member.hasPermission(`MANAGE_MESSAGES`)) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	const userToPurge = parseInt(args[0]) ? false : message.mentions.users.first();
	let numberOfMessages = userToPurge ? 99 : parseInt(args[0]);

	if (isNaN(numberOfMessages)) return message.channel.send(`**Oops**! That doesn't seem to be a number! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (numberOfMessages < 1 || numberOfMessages > 99) return message.channel.send(`**Oops**! That doesn't seem to work! Please try again with a number between 1 and 99!`).then((msg) => msg.delete({ timeout: 3500 }));

	message.channel.messages.fetch({ limit: numberOfMessages + 1 })
		.then((messages) => {
			let filteredMessages;
			if (userToPurge) {
				filteredMessages = messages.filter((msg) => msg.author.id === userToPurge.id);
				numberOfMessages = filteredMessages.length;
			}

			message.channel.bulkDelete(filteredMessages || messages, true)
				.catch((error) => {
					console.error(`Something went wrong when deleting messages: ${error}`);
					return message.channel.send(`**Oh no**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
				});

			return message.channel.send(`**Yay**! I successfully cleared ${numberOfMessages} message(s) for you!`).then((msg) => msg.delete({ timeout: 3500 }));
		});
}
