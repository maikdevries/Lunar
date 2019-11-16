const https = require('https');
const Discord = require('discord.js');

const config = require('./../config.json');


let latestVideo;


module.exports = {
	description: 'Interacts with the YouTube API to do various tasks, such as video release announcements',
	fetchVideo
};


// Polls API and checks if there is a new video release
function fetchVideo (client) {
	if (!config.youtube.enabled) return;
	if (!latestVideo) return setLatestVideo();

	fetchData().then((videoInfo) => {
		if (videoInfo.error) return;
		if (videoInfo.items[0].snippet.resourceId.videoId !== latestVideo) {

			const path = `channels?part=snippet&id=${config.youtube.channel}&key=${config.youtube.APIkey}`;
			callAPI(path).then((channelInfo) => {
				if (channelInfo.error) return;

				sendAnnouncement(client, videoInfo, channelInfo);
				latestVideo = videoInfo.items[0].snippet.resourceId.videoId;
			});
		}
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
function sendAnnouncement (client, videoInfo, channelInfo) {
	const channel = client.channels.find((ch) => ch.id === config.youtube.announcementChannelID);

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

	return channel.send(config.youtube.announcementMessage, { embed });
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
