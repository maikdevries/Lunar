const https = require('https');

module.exports = {
	description: 'All outgoing HTTPS requests to various APIs are taken care of within this file',
	getYouTube,
	getTwitch, hasTwitchToken, getTwitchToken, validateTwitchToken,
	getSpotify, hasSpotifyToken, getSpotifyToken, validateSpotifyToken
}

let twitchToken, spotifyToken;

async function getYouTube (path) {
	const options = {
		host: 'www.googleapis.com',
		path: `/youtube/v3/${path}`,
		method: 'GET'
	}

	return await createRequest(options);
}

async function getTwitch (path) {
	const options = {
		host: 'api.twitch.tv',
		path: `/helix/${path}`,
		method: 'GET',
		headers: {
			'Client-ID': process.env.TWITCH_ID,
			'Authorization': `Bearer ${twitchToken}`
		}
	}

	return await createRequest(options);
}

function hasTwitchToken () {
	return (typeof twitchToken !== 'undefined' && twitchToken !== null);
}

async function getTwitchToken () {
	const options = {
		host: 'id.twitch.tv',
		path: `/oauth2/token?client_id=${process.env.TWITCH_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`,
		method: 'POST'
	}

	return twitchToken = (await createRequest(options)).access_token;
}

async function validateTwitchToken () {
	const options = {
		host: 'id.twitch.tv',
		path: '/oauth2/validate',
		method: 'GET',
		headers: {
			'Authorization': `OAuth ${twitchToken}`
		}
	}

	return await createRequest(options);
}

async function getSpotify (path) {
	const options = {
		host: 'api.spotify.com',
		path: `/v1/${path}`,
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	}

	return await createRequest(options);
}

function hasSpotifyToken () {
	return (typeof spotifyToken !== 'undefined' && spotifyToken !== null);
}

async function getSpotifyToken () {
	const data = `${encodeURIComponent('grant_type')}=${encodeURIComponent('client_credentials')}`;

	const options = {
		host: 'accounts.spotify.com',
		path: '/api/token',
		method: 'POST',
		headers: {
			'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data)
		}
	}

	return spotifyToken = (await createRequest(options, data)).access_token;
}

async function validateSpotifyToken () {
	const options = {
		host: 'api.spotify.com',
		path: '/v1/search?q=mac+miller&type=artist',
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	}

	return await createRequest(options);
}

async function createRequest (options, data = null) {
	return new Promise((resolve, reject) => {
		const request = https.request(options, (res) => {
			if (res.statusCode === 401) return reject('UNAUTHORISED');
			if (res.statusCode !== 200) return resolve(false);

			const rawData = [];
			res.on('data', (chunk) => rawData.push(chunk));
			res.on('end', () => {
				try { return resolve(JSON.parse(Buffer.concat(rawData))) }
				catch { return resolve(false) }
			});
		}).on('error', () => resolve(false));

		if (data) request.write(data);
		request.end();
	});
}
