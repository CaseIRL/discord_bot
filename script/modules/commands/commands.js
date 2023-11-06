const bot_config = require('../../config.json');
const { create_static_embed } = require('../embeds/embeds');
const { start_giveaway } = require('../giveaways/giveaways');
const command_definitions = require('./commands.json');
const { send_ticket_embed } = require('../tickets/tickets');
const { start_poll } = require('../polls/polls');
const { set_reminder } = require('../reminders/reminders');
const { parse_duration, parse_fields } = require('../utils/utils.js');

// Initilize commands
const init_commands = async (client, guild_id) => {
    const guild = client.guilds.cache.get(guild_id);
    if (!guild) return;
    let commands;
    try {
        commands = await guild.commands.set(command_definitions);
    } catch (error) {
        console.error("Error setting permissions:", error.message);
    }
    commands = commands.filter(cmd => cmd && cmd.id);
    const command_perms = command_definitions
    .filter((_, index) => commands[index])
    .map((command_def, index) => ({
        id: commands[index].id,
        permissions: (command_def.roles || []).map(role_id => ({
            id: role_id,
            type: 'ROLE',
            permission: true,
        })),
    }));
    for (const command_perm of command_perms) {
        await guild.commands.cache.get(command_perm.id).permissions.set({ permissions: command_perm.permissions });
    }
        
};

// Handle command interactions
const handle_interaction = async (interaction, client) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    // Command to add rules embed to a channel
    if (commandName === 'rules') {
        const rules_embed = create_static_embed('rules');
        const sent_message = await interaction.channel.send({ embeds: [rules_embed] });
        await sent_message.react('✅');
        await interaction.deferReply({ ephemeral: true });
        await save_message_id('rules', sent_message.id, interaction.channel.id);
        await interaction.followUp({ content: 'Rules have been posted and saved!', ephemeral: true });
    }

    // Command to clear chat messages
    if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
            await interaction.reply('Please specify an amount between 1 and 100.');
            return;
        }
        const messages = await interaction.channel.messages.fetch({ limit: amount });
        await interaction.channel.bulkDelete(messages);
        await interaction.reply(`Deleted ${messages.size} messages!`);
    }

    // Command to start a giveaway
    if (commandName === 'giveaway') {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const fields_str = interaction.options.getString('fields');
        const winners = interaction.options.getInteger('winners');
        const duration = interaction.options.getString('duration');
        const img_1 = interaction.options.getString('giveaway_image') || 'https://media.discordapp.net/attachments/1170906290151768075/1171094246393126952/boii_masc_giveaway.png';
        const img_2 = interaction.options.getString('winners_image') || 'https://media.discordapp.net/attachments/1170906290151768075/1171094706235641877/boii_masc_winners.png';
        const fields = parse_fields(fields_str);
        if (!fields) {
            await interaction.reply({ content: 'Invalid fields format.', ephemeral: true });
            return;
        }
        const end_time = new Date(Date.now() + parse_duration(duration));
        const thumbnail = bot_config.thumbnail && bot_config.thumbnail.trim() !== '' ? bot_config.thumbnail : null;
        start_giveaway(interaction, title, description, fields, '🎉', winners, duration, end_time, thumbnail, img_1, img_2);
    }

    // Command to start a poll
    if (commandName === 'poll') {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const fields_str = interaction.options.getString('fields');
        const image = interaction.options.getString('image') || 'https://media.discordapp.net/attachments/1170906290151768075/1171111034736615484/boii_masc_votes.png';
        const thumbnail = bot_config.thumbnail && bot_config.thumbnail.trim() !== '' ? bot_config.thumbnail : null;
        await start_poll(interaction, title, description, fields_str, thumbnail, image);
    }

    // Command to display ticket options
    if (commandName === 'tickets') {
        send_ticket_embed(interaction.channel);
        await interaction.deferReply({ ephemeral: true });
    }
    
    // Command to set a reminder
    if (commandName === 'reminder') {
        const reminder_text = interaction.options.getString('reminder');
        const time_str = interaction.options.getString('timer');
        const time_ms = parse_duration(time_str);
        if (time_ms === null) {
            await interaction.reply({ content: 'Invalid time format. Please use the format like "10s", "10m", "1h", or "1d".', ephemeral: true });
            return;
        }
        set_reminder(interaction.user.id, reminder_text, time_ms, interaction.channel, client);
        await interaction.reply({ content: `<@${interaction.user.id}>, I've set a reminder for you. I'll ping you here in ${time_str} to remind you about: "${reminder_text}".`, ephemeral: true });
    }


};

// Exports
module.exports = {
    init_commands,
    handle_interaction
};
