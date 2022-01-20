const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { hasSpotifyToken, getSpotifyToken, validateSpotifyToken, getSpotify } = require('../shared/https.js');
const { failure, noResults } = require('../shared/messages.js');

module.exports = {
	memberPermissions: [],
	guildPermissions: [],
	channelPermissions: [],
	data: new SlashCommandBuilder()
		.setName('spotify')
		.setDescription('Search for songs and albums on Spotify')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('track')
				.setDescription('Search for a song')
				.addStringOption((option) => option.setName('artist').setDescription('Name of the artist').setRequired(true))
				.addStringOption((option) => option.setName('name').setDescription('Name of the song').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('album')
				.setDescription('Search for an album')
				.addStringOption((option) => option.setName('artist').setDescription('Name of the artist').setRequired(true))
				.addStringOption((option) => option.setName('name').setDescription('Name of the album').setRequired(true))
		),
	execute
}

async function execute (interaction) {
	if (!hasSpotifyToken()) await getSpotifyToken();

	try { await validateSpotifyToken() }
	catch { await getSpotifyToken() }

	const type = interaction.options.getSubcommand();
	const query = `${interaction.options.getString('artist')} ${interaction.options.getString('name')}`;
	const path = `search?q=${encodeURI(query)}&type=${type}&limit=1`;

	let data = await getSpotify(path);
	if (!data) return await interaction.reply({ content: failure(), ephemeral: true });
	if (!data.tracks?.total && !data.albums?.total) return await interaction.reply({ content: noResults(), ephemeral: true });

	data = data[`${type}s`].items[0];
	const duration = data.type === 'track' ? ['Duration', `${new Date(data.duration_ms).getMinutes()} minutes and ${new Date(data.duration_ms).getSeconds()} seconds`] : ['Number of tracks', data.total_tracks];

	const embed = new MessageEmbed()
		.setAuthor({ name: 'Spotify', url: data.external_urls.spotify, iconURL: 'https://i.imgur.com/88huJuY.png' })
		.setTitle(data.name)
		.setURL(data.external_urls.spotify)
		.setDescription(`by **${data.artists[0].name}**`)
		.addField('Release date', new Date(data.album?.release_date || data.release_date).toDateString(), true)
		.addField(duration[0], String(duration[1]), true)
		.addField('Listen on Spotify', data.external_urls.spotify)
		.setColor('#1DB954')
		.setThumbnail(data.album?.images[0].url || data.images[0].url)
		.setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.setTimestamp(Date());

	return await interaction.reply({ embeds: [embed] });
}
