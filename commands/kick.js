const { commandPrefix } = require('./../config.json');

const { guildPermissionsCheck } = require('./../shared/permissionCheck.js');

module.exports = {
	name: 'kick',
	aliases: [],
	description: 'A command to kick a user from the server, with optional reason',
	args: true,
	usage: `${commandPrefix}kick @[user(s)] - ${commandPrefix}kick @[user(s)] [reason]`,

	execute
};

function execute (client, message, args) {
	if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));

	if (!guildPermissionsCheck(client, message.guild, ['KICK_MEMBERS'])) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));

	const { users } = message.mentions;
	if (!users) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to kick! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	users.each((user) => {
		const userToKick = message.guild.members.cache.get(user.id);
		if (!userToKick) return message.channel.send(`**Uhm**... The person you're trying to kick has already left this server.`).then((msg) => msg.delete({ timeout: 3500 }));

		if (userToKick.hasPermission('KICK_MEMBERS') || userToKick.hasPermission('BAN_MEMBERS')) return message.channel.send(`**Uhm**... You can't kick someone with the same privileges as yourself!`).then((msg) => msg.delete({ timeout: 3500 }));

		userToKick.kick(args[1])
			.then((member) => message.channel.send(`**Nice**! You've successfully kicked ${member.displayName} from this server.`).then((msg) => msg.delete({ timeout: 3500 })))
			.catch((error) => {
				console.error(`An error occurred when trying to kick a member, ${error}`);
				message.channel.send('**Oh no**! Something went terribly wrong! Please try again later.').then((msg) => msg.delete({ timeout: 3500 }));
			});
	});
}
