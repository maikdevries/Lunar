const { MessageEmbed } = require('discord.js');
const { getTwitch, hasTwitchToken, getTwitchToken, validateTwitchToken } = require('../shared/https.js');
const { checkChannelPermissions } = require('../shared/functions.js');

module.exports = {
	description: 'Interacts with the Twitch API to do various tasks, such as livestream announcements',
	setup
}

const GUILDS_A_MINUTE = (800 / 5) * .95;

const defaultStreamSettings = {
	"guildID": "",
	"streaming": false,
	"sentMessages": [],
	"settings": {}
}

async function setup (client) {
	if (!hasTwitchToken()) await getTwitchToken();

	const guilds = Object.keys(await client.settings.filter('twitch.enabled', true));
	return execute(client, guilds);
}

async function execute (client, guilds) {
	for (let i = 0; i < guilds.length; i += GUILDS_A_MINUTE) {
		for (const guildID of guilds.slice(i, i + GUILDS_A_MINUTE)) await getStream(client, guildID);
		await new Promise((ignore) => setTimeout(ignore, 60000));
	}
	return setTimeout(() => setup(client), 60000);
}

async function getStream (client, guildID) {
	const guildSettings = await getGuildSettings(client, guildID);

	if (!guildSettings.settings.enabled) return await client.twitch.delete(guildID);

	try { await validateTwitchToken() }
	catch { await getTwitchToken() }

	const [userData, streamData, gameData, videoData] = await getData(null, guildSettings.settings.username, null, null);
	if (!streamData.data) return;

	if (!streamData.data[0] && guildSettings.streaming) return await sendVODAnnouncement(client, guildSettings);
	else {
		if (guildSettings.streaming) return await updateStreamAnnouncement(client, guildSettings);
		else return await sendStreamAnnouncement(client, guildSettings);
	}
}

async function sendStreamAnnouncement (client, guildSettings) {
	const [userData, streamData, gameData, videoData] = await getData(guildSettings.settings.username, guildSettings.settings.username, true, null);
	if (!userData?.data?.[0] || !streamData?.data?.[0] || !gameData?.data?.[0]) return;

	const embed = new MessageEmbed()
		.setAuthor(`${userData.data[0].display_name} is now LIVE on Twitch!`, userData.data[0].profile_image_url)
		.setTitle(streamData.data[0].title)
		.setURL(`https://twitch.tv/${userData.data[0].login}`)
		.setDescription(`**${userData.data[0].display_name}** is playing **${gameData.data[0].name}** with **${streamData.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${userData.data[0].login})`)
		.setColor('#6441A5')
		.setThumbnail((gameData.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
		.setImage(`${(streamData.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date()}`)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(streamData.data[0].started_at));

	for (const channelID of guildSettings.settings.channels) {
		let channel;
		try { channel = await client.channels.fetch(channelID) }
		catch { continue }

		if (!checkChannelPermissions(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MENTION_EVERYONE'])) continue;

		channel.send({ content: guildSettings.settings.message || ' ', embeds: [embed] }).then(async (message) => await client.twitch.push(`${guildSettings.guildID}.sentMessages`, { channelID: channel.id, messageID: message.id }, false));
	}

	return await client.twitch.set(`${guildSettings.guildID}.streaming`, true);
}

async function updateStreamAnnouncement (client, guildSettings) {
	const [userData, streamData, gameData, videoData] = await getData(guildSettings.settings.username, guildSettings.settings.username, true, null);
	if (!userData?.data?.[0] || !streamData?.data?.[0] || !gameData?.data?.[0]) return;

	for (const sentMessage of guildSettings.sentMessages) {
		let channel, message;
		try { channel = await client.channels.fetch(sentMessage.channelID) }
		catch { await client.twitch.remove(`${guildSettings.guildID}.sentMessages`, (message) => message.channelID === sentMessage.channelID); continue }

		try { message = await channel.messages.fetch(sentMessage.messageID) }
		catch { await client.twitch.remove(`${guildSettings.guildID}.sentMessages`, (message) => message.messageID === sentMessage.messageID); continue }

		if (!message?.embeds?.[0]) { await client.twitch.remove(`${guildSettings.guildID}.sentMessages`, (message) => message.messageID === sentMessage.messageID); continue }

		const updatedEmbed = new MessageEmbed(message.embeds[0])
			.setTitle(streamData.data[0].title)
			.setDescription(`**${userData.data[0].display_name}** is playing **${gameData.data[0].name}** with **${streamData.data[0].viewer_count}** people watching!\n\n[**Come watch the stream!**](https://twitch.tv/${userData.data[0].login})`)
			.setThumbnail((gameData.data[0].box_art_url).replace('{width}', '300').replace('{height}', '400'))
			.setImage(`${(streamData.data[0].thumbnail_url).replace('{width}', '1920').replace('{height}', '1080')}?date=${Date()}`);

		message.edit({ embeds: [updatedEmbed] });
	}
}

async function sendVODAnnouncement (client, guildSettings) {
	const [userData, streamData, gameData, videoData] = await getData(guildSettings.settings.username, null, null, true);
	if (!userData?.data?.[0] || !videoData?.data?.[0]) return;

	for (const sentMessage of guildSettings.sentMessages) {
		let channel, message;
		try { channel = await client.channels.fetch(sentMessage.channelID); message = await channel.messages.fetch(sentMessage.messageID) }
		catch { continue }

		if (!message?.embeds?.[0]) continue;

		const updatedEmbed = new MessageEmbed(message.embeds[0])
			.setAuthor(`${userData.data[0].display_name} was LIVE on Twitch!`, userData.data[0].profile_image_url)
			.setTitle(videoData.data[0].title)
			.setURL(videoData.data[0].url)
			.setDescription(`Today's stream has **ended** but you can watch the **VOD**!\n\n[**Watch the VOD!**](${videoData.data[0].url})`)
			.setThumbnail()
			.setImage(`${(videoData.data[0].thumbnail_url).replace('%{width}', '1920').replace('%{height}', '1080')}?date=${Date()}`);

		message.edit({ embeds: [updatedEmbed] });
	}

	await client.twitch.set(`${guildSettings.guildID}.streaming`, false);
	return await client.twitch.set(`${guildSettings.guildID}.sentMessages`, []);
}

async function getGuildSettings (client, guildID) {
	const guildSettings = await client.settings.get(`${guildID}.twitch`);
	await client.twitch.ensure(guildID, defaultStreamSettings);

	await client.twitch.set(`${guildID}.guildID`, guildID);
	await client.twitch.set(`${guildID}.settings`, guildSettings);

	return await client.twitch.get(guildID);
}

async function getData (userUsername, streamUsername, gameID, videoUserID) {
	let [userData, streamData, gameData, videoData] = [null, null, null, null];

	if (userUsername) userData = await getTwitch(`users?login=${userUsername}`);
	if (streamUsername) streamData = await getTwitch(`streams?user_login=${streamUsername}`);

	if (gameID && streamData.data?.[0]?.game_id) gameData = await getTwitch(`games?id=${streamData.data[0].game_id}`);
	else if (gameID) gameData = await getTwitch(`games?id=${gameID}`);

	if (videoUserID && userData.data?.[0]?.id) videoData = await getTwitch(`videos?user_id=${userData.data[0].id}&first=1&type=archive`);
	else if (videoUserID) videoData = await getTwitch(`videos?user_id=${videoUserID}&first=1&type=archive`);

	return [userData, streamData, gameData, videoData];
}
