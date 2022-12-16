const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

	const embed = new EmbedBuilder()
		.setAuthor({ name: `The latest information on ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.addFields(
			{ name: 'Version', 'value': package.version, inline: true },
			{ name: 'Commit', value: `[${commit}](${package.homepage}/commit/${commit})`, inline: true },
			{ name: 'Repository', value: `[GitHub repository](${package.homepage})`, inline: true },
			{ name: 'Public invite', value: `[${process.env.WEBSITE}/invite](https://${process.env.WEBSITE}/invite)`, inline: true },
			{ name: 'Support', value: `[${process.env.WEBSITE}/support](https://${process.env.WEBSITE}/support)`, inline: true },
		)
		.setColor('#233A54')
		.setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.setTimestamp();

	return await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function getCommit () {
	const { stdout } = await exec('git rev-parse HEAD');
	return stdout.trim().slice(0, 7);
}
