module.exports = {
	name: 'kick',
	description: 'A command to kick a user from the server, with optional reason',
	usage: '!kick @[user] - !kick @[user] [reason]',
	args: true,
	aliases: [],

	execute
};

function execute (message, args) {
	if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	const user = message.mentions.users.first();
	if (!user) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to kick! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	const userToKick = message.guild.members.find((member) => member.id === user.id);
	if (!userToKick) return message.channel.send(`**Uhm**... The person you're trying to kick has already left this server.`).then((msg) => msg.delete({ timeout: 3500 }));

	userToKick.kick(args[1])
		.then((member) => {
			message.delete();
			return message.channel.send(`**Nice**! You've successfully kicked ${member.displayName} from this server.`).then((msg) => msg.delete({ timeout: 3500 }));
		})
		.catch((error) => {
			console.error(`An error occurred when trying to kick a member, ${error}`);
			message.channel.send('**Oh no**! Something went terribly wrong! Please try again later.').then((msg) => msg.delete({ timeout: 3500 }));
		});
}
