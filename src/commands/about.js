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
		.setAuthor(`The latest information on ${interaction.client.user.username}`, interaction.client.user.avatarURL())
		.addField('Version', package.version, true)
		.addField('Commit', `[${commit}](${package.homepage}/commit/${commit})`, true)
		.addField('Repository', `[GitHub repository](${package.homepage})`, true)
		.addField('Public invite', '[maikdevries.com/lunar](https://maikdevries.com/lunar)', true)
		.addField('Support', 'https://discord.gg/aMeGvFD', true)
		.setColor('#233A54')
		.setFooter(`Powered by ${interaction.client.user.username}`, interaction.client.user.avatarURL())
		.setTimestamp(Date());

	return await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function getCommit () {
	const { stdout } = await exec('git rev-parse HEAD');
	return stdout.trim().slice(0, 7);
}
