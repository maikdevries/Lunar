const { execSync } = require(`child_process`);
const { MessageEmbed } = require(`discord.js`);

const package = require(`./../package.json`);

module.exports = {
	name: `about`,
	aliases: [`version`],
	description: `A command to get the latest technical information on the bot`,
	args: false,
	usage: `[PREFIX]about`,
	execute
}


async function execute (client, message, ignore) {
	const embed = new MessageEmbed()
		.setAuthor(`Technical information on ${client.user.username}`, client.user.avatarURL())
		.setDescription(`The latest technical information on ${client.user.username}:`)
		.addField(`Version`, package.version, true)
		.addField(`Commit`, `[${await getCommit()}](${package.homepage}/commit/${await getCommit()})`, true)
		.addField(`Source code`, `[GitHub repository](${package.homepage})`, true)
		.addField(`Public invite`, `[lunar.marvonon.com](https://lunar.marvonon.com)`, true)
		.addField(`Support`, `https://discord.gg/aMeGvFD`, true)
		.setColor(`#233A54`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(Date.now());

	return message.channel.send({ embed });
}

async function getCommit () {
	return execSync(`git rev-parse HEAD`)
		.toString()
		.trim()
		.slice(0, 7);
}
