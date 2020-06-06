const { commandPrefix } = require('./../config.json');

module.exports = {
	name: 'ban',
	aliases: [],
	description: 'A command to ban a user from the server, with optional reason',
	args: true,
	usage: `${commandPrefix}ban @[user(s)] - ${commandPrefix}ban @[user(s)] [reason]`,

	execute
};

function execute (client, message, args) {
	if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	const botMember = message.guild.members.cache.get(client.user.id);
	if (!botMember.hasPermission('BAN_MEMBERS')) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));

	const { users } = message.mentions;
	if (!users) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to ban! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	users.each((user) => {
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
	});
}
