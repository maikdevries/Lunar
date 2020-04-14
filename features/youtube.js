const https = require('https');
const Discord = require('discord.js');

const config = require('./../config.json');


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
	if (!latestVideo) return setLatestVideo();

	fetchData().then((videoInfo) => {
		if (videoInfo.error) return;
		if (videoInfo.items[0].snippet.resourceId.videoId === latestVideo) return;

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
	const channel = client.channels.cache.get(config.youtube.video.announcementChannelID);

	if (!channel) return console.error(`Couldn't send YouTube new video announcement because the channel couldn't be found.`);

	// Regex to cut off the video description at the last whole word at 237 characters
	const description = (videoInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

	const embed = new Discord.MessageEmbed()
		.setAuthor(`${channelInfo.items[0].snippet.title} has uploaded a new YouTube video!`, channelInfo.items[0].snippet.thumbnails.high.url)
		.setTitle(videoInfo.items[0].snippet.title)
		.setURL(`https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId}`)
		.setDescription(`${description}...\n\n[**Watch the video here!**](https://www.youtube.com/watch?v=${videoInfo.items[0].snippet.resourceId.videoId})`)
		.setColor('#FF0000')
		.setImage(videoInfo.items[0].snippet.thumbnails.maxres.url)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(videoInfo.items[0].snippet.publishedAt));

	return channel.send(config.youtube.video.announcementMessage, { embed });
}


// Polls API and checks whether channel is currently streaming
function fetchStream (client) {
	if (!config.youtube.stream.enabled) return;

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
	const channel = client.channels.cache.get(config.youtube.stream.announcementChannelID);

	if (!channel) return console.error(`Couldn't send YouTube livestream announcement because the announcement channel couldn't be found.`);

	// Regex to cut off the video description at the last whole word at 237 characters
	const description = (streamInfo.items[0].snippet.description).replace(/^([\s\S]{237}[^\s]*)[\s\S]*/, '$1');

	const embed = new Discord.MessageEmbed()
		.setAuthor(`${streamInfo.items[0].snippet.channelTitle} is now LIVE on YouTube!`)
		.setTitle(streamInfo.items[0].snippet.title)
		.setURL(`https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId}`)
		.setDescription(`${description}...\n\n[**Watch the stream here!**](https://www.youtube.com/watch?v=${streamInfo.items[0].id.videoId})`)
		.setColor('#FF0000')
		.setImage(streamInfo.items[0].snippet.thumbnails.high.url)
		.setFooter(`Powered by ${client.user.username}`, client.user.avatarURL())
		.setTimestamp(new Date(streamInfo.items[0].snippet.publishedAt));

	return channel.send(config.youtube.stream.announcementMessage, { embed });
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
					resolve(JSON.parse(rawData));
				} catch (error) { console.error(`An error occurred parsing the API response to JSON, ${error}`); }
			});

		}).on('error', (error) => console.error(`Error occurred while polling YouTube API, ${error}`));
	});
}
