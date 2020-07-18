require(`dotenv`).config()

const Discord = require(`discord.js`);
const client = new Discord.Client({ partials: [`MESSAGE`, `REACTION`] });

const database = require(`./database/setup.js`);
const defaultGuildSettings = require(`./database/defaultGuildSettings.json`);

const commandHandler = require(`./features/commandHandler.js`);
const reactionRole = require(`./features/reactionRole.js`);
const serverLock = require(`./features/serverLock.js`);
const streamStatus = require(`./features/streamStatus.js`);
const twitch = require(`./features/twitch.js`);
const welcomeMessage = require(`./features/welcomeMessage.js`);
const youtube = require(`./features/youtube.js`);


// Client setup function to be executed as soon as client instance has fully loaded
client.on(`ready`, async () => {
	try { await client.user.setUsername(process.env.DISCORD_USERNAME) }
	catch (error) { console.error(`Something went wrong when setting the client's username: ${error}`) }

	try { await client.user.setActivity(process.env.DISCORD_ACTIVITY, { type: `PLAYING` }) }
	catch (error) { console.error(`Something went wrong when setting the client's activity: ${error}`) }

	try { await client.user.setAvatar(`./avatar.png`) }
	catch (error) { console.error(`Something went wrong when setting the client's avatar: ${error}`) }

	await database.setup(client);
	await commandHandler.setup();
	await twitch.setup(client);
	await youtube.setup(client);

	console.log(`${client.user.username} has loaded successfully and is now online!`);
});

// Creates a record with the default guild settings for the Discord server the bot joined
client.on(`guildCreate`, (guild) => {
	client.settings.set(guild.id, defaultGuildSettings);
});

// Deletes the server specific settings from the database when the bot leaves the Discord server
client.on(`guildDelete`, (guild) => {
	client.settings.delete(guild.id);
});

// Handles the command logic in a separate NodeJS module
client.on(`message`, (message) => {
	commandHandler.execute(client, message);
});

// Triggers the message event to support message edits
client.on(`messageUpdate`, (ignore, newMessage) => {
	client.emit(`message`, newMessage);
});

// Adds a shoutout Discord role to currently streaming members
client.on(`presenceUpdate`, (oldPresence, newPresence) => {
	streamStatus.setStatus(client, oldPresence, newPresence);
});

// Adds role to user based on reaction added to message
client.on(`messageReactionAdd`, (reaction, user) => {
	reactionRole.roleAdd(client, reaction, user);
	serverLock.memberUnlock(client, reaction, user);
});

// Removes role from user based on reaction removed from message
client.on(`messageReactionRemove`, (reaction, user) => {
	reactionRole.roleRemove(client, reaction, user);
});

// Sends out a welcome message for a new member and give them the locked role
client.on(`guildMemberAdd`, (member) => {
	welcomeMessage.memberAdd(client, member);
	serverLock.memberLock(client, member);
});

// Sends out a leave message for a leaving member
client.on(`guildMemberRemove`, (member) => {
	welcomeMessage.memberRemove(client, member);
});

client.on(`warn`, (warning) => {
	console.warn(`Something went wrong, a warning was thrown: ${warning}`);
});

client.on(`error`, (error) => {
	console.error(`Something went wrong, an error was thrown: ${error}`);
});

client.login(process.env.DISCORD_TOKEN);


process.on(`unhandledRejection`, (error) => {
	console.error(`Something went wrong, an unhandled promise rejection: ${error}`);
});

process.on(`uncaughtException`, (error) => {
	console.error(`Something went wrong, an unhandled exception: ${error}`);
	client.destroy();
	process.exit();
});
