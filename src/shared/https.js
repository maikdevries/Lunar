module.exports = {
	description: 'All outgoing HTTPS requests to various APIs are taken care of within this file',
	getYouTube,
	getTwitch, hasTwitchToken, getTwitchToken, validateTwitchToken,
	getSpotify, hasSpotifyToken, getSpotifyToken, validateSpotifyToken
}

let twitchToken, spotifyToken;

async function getYouTube (path) {
	const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);

	const options = {
		method: 'GET'
	}

	try { return await createRequest(url, options) }
	catch (error) { return null }
}

async function getTwitch (path) {
	const url = new URL(`https://api.twitch.tv/helix/${path}`);

	const options = {
		method: 'GET',
		headers: {
			'Client-ID': process.env.TWITCH_ID,
			'Authorization': `Bearer ${twitchToken}`
		}
	}

	try { return await createRequest(url, options) }
	catch (error) { return null }
}

function hasTwitchToken () {
	return (typeof twitchToken !== 'undefined' && twitchToken !== null);
}

async function getTwitchToken () {
	const url = new URL(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`);

	const options = {
		method: 'POST'
	}

	return (twitchToken = (await createRequest(url, options))?.access_token);
}

async function validateTwitchToken () {
	const url = new URL('https://id.twitch.tv/oauth2/validate');

	const options = {
		method: 'GET',
		headers: {
			'Authorization': `OAuth ${twitchToken}`
		}
	}

	return await createRequest(url, options);
}

async function getSpotify (path) {
	const url = new URL(`https://api.spotify.com/v1/${path}`);

	const options = {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	}

	try { return await createRequest(url, options) }
	catch (error) { return null }
}

function hasSpotifyToken () {
	return (typeof spotifyToken !== 'undefined' && spotifyToken !== null);
}

async function getSpotifyToken () {
	const url = new URL('https://accounts.spotify.com/api/token');

	const options = {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_ID}:${process.env.SPOTIFY_SECRET}`).toString('base64')}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: `${encodeURIComponent('grant_type')}=${encodeURIComponent('client_credentials')}`
	}

	return (spotifyToken = (await createRequest(url, options))?.access_token);
}

async function validateSpotifyToken () {
	const url = new URL('https://api.spotify.com/v1/search?q=mac+miller&type=artist');

	const options = {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${spotifyToken}`
		}
	}

	return await createRequest(url, options);
}

async function createRequest (url, options) {
	try {
		const response = await fetch(url, options);
		return response.ok ? await response.json() : (() => { throw new Error(`Fetch API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { console.error(error); throw error.toString() }
}
