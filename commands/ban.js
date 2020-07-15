const { guildPermissionsCheck } = require(`./../shared/permissionCheck.js`);

module.exports = {
	name: `ban`,
	aliases: [],
	description: `A command to ban a member from the server`,
	args: true,
	usage: `[PREFIX]ban @[user(s)] (reason)`,
	execute
}


function execute (client, message, args) {
	if (!message.member.hasPermission(`BAN_MEMBERS`)) return message.channel.send(`**Oh no**! You don't have the right perks to do this!`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!guildPermissionsCheck(client, message.guild, [`BAN_MEMBERS`])) return message.channel.send(`**Yikes**! It seems like I don't have the right permissions to do this.`).then((msg) => msg.delete({ timeout: 3500 }));
	if (!message.mentions.members) return message.channel.send(`**Oh snap**! You forgot to mention the person you would like to ban! Try again.`).then((msg) => msg.delete({ timeout: 3500 }));

	message.mentions.members.forEach((member) => {
		if (member.hasPermission(`BAN_MEMBERS`)) return message.channel.send(`**Uhm**... You can't ban someone with the same privileges as yourself!`).then((msg) => msg.delete({ timeout: 3500 }));

		member.ban({ days: 7, reason: args[1] })
			.then((member) => message.channel.send(`**Nice**! You've successfully banned ${member.displayName} from this server.`).then((msg) => msg.delete({ timeout: 3500 })))
			.catch((error) => {
				console.error(`Something went wrong when banning a member: ${error}`);
				return message.channel.send(`**Oh no**! Something went terribly wrong! Please try again later.`).then((msg) => msg.delete({ timeout: 3500 }));
			});
	});
}
