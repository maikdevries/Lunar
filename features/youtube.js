const https = require('https');
const { MessageEmbed } = require('discord.js');

const config = require('./../config.json');

const { channelPermissionsCheck } = require('./../shared/permissionCheck.js');


let latestVideo;
let streamID;


module.exports = {
	description: 'Interacts with the YouTube API to do various tasks, such as video release announcements',
	fetchVideo,
	fetchStream
};


// Polls API and checks if there is a new video release
function fetchVideo (client) {
	if (!config.youtube.video.enabled) return;

	if (config.youtube.video.channels.length) return console.error(`Cannot send YouTube video announcement, no announcement channels were specified in the config!`);

	if (!latestVideo) return setLatestVideo();

	fetchData().then((videoInfo) => {
		if (videoInfo.error) return;
		if (videoInfo.items[0].snippet.resourceId.videoId === latestVideo) return;

		// Return if the video hasn't been uploaded in the last 12 hours
		if (Math.abs(Date.parse(videoInfo.items[0].snippet.publishedAt) - Date.now()) >= 43200000) return;

		const path = `channels?part=snippet&id=${config.youtube.channel}&key=${config.youtube.APIkey}`;
		callAPI(path).then((channelInfo) => {
			if (channelInfo.error) return;

			sendVideoAnnouncement(client, videoInfo, channelInfo);
			latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
		});
	});
}

// At start of the bot, fetches the latest video which is compared to if an announcement needs to be sent
function setLatestVideo () {
	fetchData().then((videoInfo) => {
		if (videoInfo.error) return;

		latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
	});
}

// Fetches data required to check if there is a new video release
async function fetchData () {
	let path = `channels?part=contentDetails&id=${config.youtube.channel}&key=${config.youtube.APIkey}`;
	const channelContent = await callAPI(path);

	path = `playlistItems?part=snippet&maxResults=1&playlistId=${channelContent.items[0].contentDetails.relatedPlaylists.uploads}&key=${config.youtube.APIkey}`;
	const videoInfo = await callAPI(path);

	return videoInfo;
}

// Constructs a MessageEmbed and sends it to new video announcements channel
function sendVideoAnnouncement (client, videoInfo, channelInfo) {
	// Regex to cut off the video description at the last whole word at 237 characters
	const description = (videoInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

	const embed = new MessageEmbed()
		.setAuthor(`${channelInfo.items[0].snippet.title} has uploaded a new YouTube video!`, channelInfo.items[0].snippet.thumbnails.high.url)
		.setTitle(videoInfo.items[0].snippet.title)
		.setURL(`https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId}`)
		.setDescription(`${description}...\n\n[**Watch the video here!**](https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId})`)
		.setColor('#FF0000')
		.setImage(videoInfo.items[0].snippet.thumbnails.maxres.url)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(videoInfo.items[0].snippet.publishedAt));

	config.youtube.video.channels.forEach((channelID) => {
		const channel = client.channels.cache.get(channelID);
		if (!channel) return console.error(`Couldn't send YouTube new video announcement to ${channelID} because the channel couldn't be found.`);

		if (!channelPermissionsCheck(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MENTION_EVERYONE'])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES or MENTION_EVERYONE) to send out YouTube announcement to ${channel.name}!`);

		return channel.send(config.youtube.video.message, { embed });
	});
}


// Polls API and checks whether channel is currently streaming
function fetchStream (client) {
	if (!config.youtube.stream.enabled) return;

	if (config.youtube.stream.channels.length) return console.error(`Cannot send YouTube stream announcement, no announcement channels were specified in the config!`);

	const path = `search?part=snippet&channelId=${config.youtube.channel}&maxResults=1&eventType=live&type=video&key=${config.youtube.APIkey}`;

	callAPI(path).then((streamInfo) => {
		if (streamInfo.error || !streamInfo.items[0]) return;
		if (streamID === streamInfo.items[0].id.videoId) return;

		streamID = streamInfo.items[0].id.videoId;
		sendStreamAnnouncement(client, streamInfo);
	});
}

// Constructs a MessageEmbed and sends it to livestream announcements channel
function sendStreamAnnouncement (client, streamInfo) {
	// Regex to cut off the video description at the last whole word at 237 characters
	const description = (streamInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

	const embed = new MessageEmbed()
		.setAuthor(`${streamInfo.items[0].snippet.channelTitle} is now LIVE on YouTube!`)
		.setTitle(streamInfo.items[0].snippet.title)
		.setURL(`https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId}`)
		.setDescription(`${description}...\n\n[**Watch the stream here!**](https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId})`)
		.setColor('#FF0000')
		.setImage(streamInfo.items[0].snippet.thumbnails.high.url)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(streamInfo.items[0].snippet.publishedAt));

	config.youtube.stream.channels.forEach((channelID) => {
		const channel = client.channels.cache.get(channelID);
		if (!channel) return console.error(`Couldn't send YouTube livestream announcement because the announcement channel couldn't be found.`);

		if (!channelPermissionsCheck(client, channel, ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MENTION_EVERYONE'])) return console.error(`Missing permissions (VIEW_CHANNEL or SEND_MESSAGES or MENTION_EVERYONE) to send out YouTube announcement to ${channel.name}!`);

		return channel.send(config.youtube.stream.message, { embed });
	});
}


// Template HTTPS get function that interacts with the YouTube API, wrapped in a Promise
function callAPI (path) {
	return new Promise((resolve) => {

		const options = {
			host: 'www.googleapis.com',
			path: `/youtube/v3/${path}`
		};

		https.get(options, (res) => {
			if (res.statusCode !== 200) return;

			const rawData = [];
			res.on('data', (chunk) => rawData.push(chunk));
			res.on('end', () => {
				try {
					resolve(JSON.parse(Buffer.concat(rawData)));
				} catch (error) { console.error(`An error occurred parsing the YouTube API response to JSON, ${error}`); }
			});

		}).on('error', (error) => console.error(`Error occurred while polling YouTube API, ${error}`));
	});
}
