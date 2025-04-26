const { SlashCommandBuilder } = require('discord.js');
const cron = require('node-cron');
const { CronExpressionParser } = require('cron-parser');

const {
	WORKING_START_HOUR,
	WORKING_END_HOUR_REGULAR,
	WORKING_END_HOUR_FRIDAY,
	CHANNEL_NAME_WORKING_HOURS,
	CHANNEL_NAME_NIGHTTIME,
	CHANNEL_NAME_WEEKEND,
} = process.env;

module.exports = {
	name: 'channelnamechanger',
	description: 'Change the channel name based on the time of day',
	options: [
		{
			name: 'channel',
			type: 7, // CHANNEL TYPE
			description: 'Channel that will act as the "Coworking Channel"',
			required: true,
		},
	],
	data: new SlashCommandBuilder()
		.setName('channelnamechanger')
		.setDescription('Change the channel name based on the time of day')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('Channel that will act as the "Coworking Channel"')
				.setRequired(true),
		),
	execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		if (!channel) {
			return interaction.reply('Please provide a valid channel.');
		}
		if (channel.id === interaction.channel.id) {
			return interaction.reply('You cannot set the same channel as the coworking channel.');
		}
		const workingHoursTask = workingHoursTaskFactory(interaction);
		const nighttimeTask = nighttimeTaskFactory(interaction);
		const weekendTask = weekendTaskFactory(interaction);

		workingHoursTask.start();
		nighttimeTask.start();
		weekendTask.start();

		try {
			const firstInterval = CronExpressionParser.parse(WORKING_START_HOUR);
			const secondInterval = CronExpressionParser.parse(WORKING_END_HOUR_REGULAR);
			const thirdInterval = CronExpressionParser.parse(WORKING_END_HOUR_FRIDAY);

			    // Get the most recent execution times
			const firstPrev = firstInterval.prev().toDate();
			const secondPrev = secondInterval.prev().toDate();
			const thirdPrev = thirdInterval.prev().toDate();

			// Determine the most recent execution
			const mostRecent = Math.max(firstPrev, secondPrev, thirdPrev);

			if (mostRecent === firstPrev.getTime()) {
				channel.setName(CHANNEL_NAME_WORKING_HOURS);
			}
			else if (mostRecent === secondPrev.getTime()) {
				channel.setName(CHANNEL_NAME_NIGHTTIME);
			}
			else if (mostRecent === thirdPrev.getTime()) {
				channel.setName(CHANNEL_NAME_WEEKEND);
			}
		}
		catch (error) {
			console.error('Error scheduling tasks:', error);
			return interaction.reply('An error occurred while scheduling tasks.');
		}

		return interaction.reply(`Tasks scheduled for ${channel.name}`);
	},
};

const workingHoursTaskFactory = (interaction) => cron.schedule(WORKING_START_HOUR, () => {
	interaction.options.getChannel('channel').setName(CHANNEL_NAME_WORKING_HOURS);
	interaction.reply(`Channel name changed to ${CHANNEL_NAME_WORKING_HOURS}`);
});
const nighttimeTaskFactory = (interaction) => cron.schedule(WORKING_END_HOUR_REGULAR, () => {
	interaction.options.getChannel('channel').setName(CHANNEL_NAME_NIGHTTIME);
	interaction.reply(`Channel name changed to ${CHANNEL_NAME_NIGHTTIME}`);
});
const weekendTaskFactory = (interaction) => cron.schedule(WORKING_END_HOUR_FRIDAY, () => {
	interaction.options.getChannel('channel').setName(CHANNEL_NAME_WEEKEND);
	interaction.reply(`Channel name changed to ${CHANNEL_NAME_WEEKEND}`);
});
