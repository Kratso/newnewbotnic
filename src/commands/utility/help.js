const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const CHANNEL_COMMANDS = path.join(__dirname, '../channelmnmt');
const MISC_COMMANDS = path.join(__dirname);

module.exports = {
	name: 'help',
	description: 'List all available commands.',
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List of commands'),
	execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Help for Jose Tomás Segundo')
			.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
			.setAuthor({
				name: 'Jose Tomás Segundo',
				iconURL: 'https://i.imgur.com/VDml2Gi.jpg',
				url: 'https://twitter.com/KratsoZerusa',
			})
			.setDescription('List of all Josetomasian Commands')
			.setTimestamp()
			.setFooter({
				text: 'Powered by Kratso @kratso',
				iconURL: 'https://i.imgur.com/VDml2Gi.jpg',
			})
			.setThumbnail('https://i.imgur.com/VDml2Gi.jpg');

		const commands = new Map();

		const miscFiles = fs
			.readdirSync(CHANNEL_COMMANDS)
			.filter((file) => file.endsWith('.js'));

		const utilityFiles = fs
			.readdirSync(MISC_COMMANDS)
			.filter((file) => file.endsWith('.js'));

		commands.set('Channel Utility Commands', [CHANNEL_COMMANDS, [...miscFiles]]);
		commands.set('Miscellanous Commands', [MISC_COMMANDS, [...utilityFiles]]);

		Array.from(commands.entries()).forEach((cmd) => {
			embed.addFields({ name: cmd[0], value: '\u200b', inline: false });
			cmd[1][1].forEach((file) => {
				// Use the absolute path directly
				const commandPath = path.join(cmd[1][0], file);
				const command = require(commandPath);

				// Validate that the command has a name and description
				const commandName = command.name || command.data?.name;
				const commandDescription = command.description || command.data?.description;

				if (commandName && commandDescription) {
					embed.addFields({
						name: commandName,
						value: commandDescription,
						inline: true,
					});
				}
				else {
					console.warn(`Invalid command file: ${commandPath}`);
				}
			});
			embed.addFields({ name: '\u200b', value: '\u200b', inline: false });
		});

		return void interaction.reply({ embeds: [embed] });
	},
};