const { successful, missingMention, memberSamePermissions } = require(`../shared/messages.js`);

module.exports = {
	name: `ban`,
	aliases: [],
	description: `A command to ban a member from the server`,
	memberPermissions: [`BAN_MEMBERS`],
	guildPermissions: [`BAN_MEMBERS`],
	channelPermissions: [],
	args: `[member(s)] (reason)`,
	execute
}


async function execute (ignore, message, args) {
	if (!message.mentions.members?.size) return missingMention(message.channel, `member`);

	message.mentions.members.forEach(async (member) => {
		if (member.hasPermission(`BAN_MEMBERS`)) return memberSamePermissions(message.channel);

		await member.ban({ days: 7, reason: args.slice(message.mentions.members.size).join(` `) });
		return successful(message.channel);
	});
}
