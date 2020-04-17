const { execSync } = require('child_process');
const { MessageEmbed } = require('discord.js');

const package = require('./../package.json');

module.exports = {
	name: 'about',
	description: 'A command to get the latest technical information on the bot',
	usage: '!about',
	aliases: ['version'],

	execute
};

function execute (client, message, ignore) {
	client.generateInvite(469920839).then((inviteLink) => {
		const embed = new MessageEmbed()
			.setAuthor(`The latest information on ${client.user.username}`, client.user.avatarURL())
			.addField('Version', package.version, true)
			.addField('Commit', `[${getCommit()}](${package.homepage}/commit/${getCommit()})`, true)
			.addField('Source code', `[GitHub repository](${package.homepage})`)
			.addField('Invite link', `[Link to invite the bot to your server](${inviteLink})`)
			.setColor('#233A54')
			.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
			.setTimestamp(Date.now());

		return message.channel.send({ embed });
	});
}

// Returns the commit hash of the latest version
function getCommit () {
	return execSync('git rev-parse HEAD')
		.toString()
		.trim()
		.slice(0, 7);
}
