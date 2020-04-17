module.exports = {
	name: 'ban',
	description: 'A command to ban a user from the server, with optional reason',
	usage: '!ban @[user] - !ban @[user] [reason]',
	args: true,
	aliases: [],

	execute
};

function execute (ignore, message, args) {
	if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	const user = message.mentions.users.first();
	if (!user) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to ban! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	const userToBan = message.guild.members.cache.get(user.id);
	if (!userToBan) return message.channel.send(`**Uhm**... The person you're trying to ban has already left this server.`).then((msg) => msg.delete({ timeout: 3500 }));

	if (userToBan.hasPermission('BAN_MEMBERS')) return message.channel.send(`**Uhm**... You can't ban someone with the same privileges as yourself!`).then((msg) => msg.delete({ timeout: 3500 }));

	userToBan.ban({ days: 7, reason: args[1] })
		.then((member) => {
			message.delete();
			return message.channel.send(`**Nice**! You've successfully banned ${member.displayName} from this server.`).then((msg) => msg.delete({ timeout: 3500 }));
		})
		.catch((error) => {
			console.error(`An error occurred when trying to ban a member, ${error}`);
			message.channel.send('**Oh no**! Something went terribly wrong! Please try again later.').then((msg) => msg.delete({ timeout: 3500 }));
		});
}
