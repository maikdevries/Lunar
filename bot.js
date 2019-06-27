const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');

const welcomeMessage = require('./features/welcomeMessage.js');


client.on('ready', async () => {
	if (config.username) {
		await client.user.setUsername(config.username)
			.catch((error) => console.error(`An error occurred when setting the username, ${error}`));
	} else {
		await client.user.setUsername('Source')
			.catch((error) => console.error(`An error occurred when setting the username, ${error}`));
	}

	client.user.setAvatar('./avatar.png')
		.catch((error) => console.error(`An error occurred when setting the avatar, ${error}`));

	if (config.activity) {
		client.user.setActivity(config.activity, { type: 'PLAYING' })
			.catch((error) => console.error(`An error occurred when setting the default activity, ${error}`));
	} else {
		client.user.setActivity('with Admin perks', { type: 'PLAYING' })
			.catch((error) => console.error(`An error occurred when setting the default activity, ${error}`));
	}

	console.log(`${client.user.username} has loaded successfully and is now online!`);
});


// Sends out a welcome message when a new user joins the server
client.on('guildMemberAdd', (member) => {
	welcomeMessage.memberAdd(member);
});

// Sends out a leave message when an user leaves the server
client.on('guildMemberRemove', (member) => {
	welcomeMessage.memberRemove(member);
});


client.on('error', (error) => {
	console.error(`An error occurred with Discord, ${error}`);
});

client.login(config.token);


process.on('SIGINT', () => {
	client.destroy();
	process.exit();
});
