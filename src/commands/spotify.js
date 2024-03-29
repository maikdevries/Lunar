const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
	const path = `search?q=${encodeURIComponent(query)}&type=${type}&limit=1`;

	let data = await getSpotify(path);
	if (!data) return await interaction.reply({ content: failure(), ephemeral: true });
	if (!data.tracks?.total && !data.albums?.total) return await interaction.reply({ content: noResults(), ephemeral: true });

	data = data[`${type}s`].items[0];
	const duration = data.type === 'track' ? ['Duration', `${new Date(data.duration_ms).getMinutes()} minutes and ${new Date(data.duration_ms).getSeconds()} seconds`] : ['Number of tracks', data.total_tracks];

	const embed = new EmbedBuilder()
		.setAuthor({ name: 'Spotify', url: data.external_urls.spotify, iconURL: 'https://i.imgur.com/88huJuY.png' })
		.setTitle(data.name)
		.setURL(data.external_urls.spotify)
		.setDescription(`by **${data.artists[0].name}**`)
		.addFields(
			{ name: 'Release date', value: new Date(data.album?.release_date || data.release_date).toDateString(), inline: true },
			{ name:  duration[0], value: String(duration[1]), inline: true },
			{ name: 'Listen on Spotify', value: data.external_urls.spotify, inline: false },
		)
		.setColor('#1DB954')
		.setThumbnail(data.album?.images[0].url || data.images[0].url)
		.setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.avatarURL() })
		.setTimestamp();

	return await interaction.reply({ embeds: [embed] });
}
