const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const exec = require('util').promisify(require('child_process').exec);
const package = require('../../package.json');

module.exports = {
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Get the latest information on the bot'),
	execute
}

async function execute (interaction) {
	const commit = await getCommit();

	const embed = new MessageEmbed()
		.setAuthor({ name: `The latest information on ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.addField('Version', package.version, true)
		.addField('Commit', `[${commit}](${package.homepage}/commit/${commit})`, true)
		.addField('Repository', `[GitHub repository](${package.homepage})`, true)
		.addField('Public invite', `[${process.env.WEBSITE}](https://${process.env.WEBSITE})`, true)
		.addField('Support', `[${process.env.WEBSITE}/support](https://${process.env.WEBSITE}/support)`, true)
		.setColor('#233A54')
		.setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.setTimestamp(Date());

	return await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function getCommit () {
	const { stdout } = await exec('git rev-parse HEAD');
	return stdout.trim().slice(0, 7);
}
