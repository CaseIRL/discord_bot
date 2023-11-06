const { ChannelType, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const { create_static_embed, create_dynamic_embed  } = require('../embeds/embeds');
const embed_options = require('../embeds/static_embeds.json');
const { get_ticket_count, save_ticket_to_db, save_message_id, close_ticket } = require('../database/database');
const bot_config = require('../../config.json');

// Function to send the main ticket embed
const send_ticket_embed = async (channel) => {
    const ticket_embed = create_static_embed('ticket');
    const embed_content = require('../embeds/static_embeds.json').ticket;
    const row = new ActionRowBuilder();
    embed_content.fields.forEach(field => {
        const button = new ButtonBuilder()
            .setCustomId(`ticket-${field.name.toLowerCase().replace(/\s/g, '_')}`)
            .setLabel(field.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(field.emoji);
        row.addComponents(button);
    });
    const sent_message = await channel.send({ embeds: [ticket_embed], components: [row] });
    await save_message_id('ticket', sent_message.id, channel.id);
};

// Function to handle ticket button clicks
const handle_ticket_button = async interaction => {
    const button_id = interaction.customId;
    if (button_id.startsWith('ticket-')) {
        const ticket_type = button_id.split('-')[1];
        show_ticket_type_modal(interaction, ticket_type);
    }
};

// Function to show a modal depending on ticket type
function show_ticket_type_modal(interaction, ticket_type) {
    const modal_id = `ticket_modal_${ticket_type}`;
    const modal_title = `${ticket_type.charAt(0).toUpperCase() + ticket_type.slice(1)} Ticket Form`;
    const modal = new ModalBuilder()
        .setCustomId(modal_id)
        .setTitle(modal_title);
    const ticket_config = embed_options.ticket.fields.find(field => field.name.toLowerCase().replace(/\s/g, '_') === ticket_type);
    if (ticket_config && ticket_config.modal_fields) {
        ticket_config.modal_fields.forEach((field, index) => {
            if (index < 5) {
                const text_input = new TextInputBuilder()
                    .setCustomId(`field_${index}`)
                    .setLabel(field.label)
                    .setPlaceholder(field.placeholder)
                    .setRequired(field.required)
                    .setStyle(field.style === 'short' ? TextInputStyle.Short : TextInputStyle.Paragraph);
                const action_row = new ActionRowBuilder().addComponents(text_input);
                modal.addComponents(action_row);
            }
        });
    }
    interaction.showModal(modal);
}

// Function to handle ticket modal submission
async function handle_ticket_modal(modal) {
    const ticket_type = modal.customId.split('_')[2];
    const ticket_config = embed_options.ticket.fields.find(field => field.name.toLowerCase().replace(/\s/g, '_') === ticket_type);
    const responses = [];
    if (ticket_config && ticket_config.modal_fields) {
        ticket_config.modal_fields.forEach((field, index) => {
            const response = modal.fields.getTextInputValue(`field_${index}`);
            responses.push({ name: field.label, value: response, inline: false });
        });
    }
    const { guild } = modal;
    const user = modal.user;
    try {
        const current_ticket_count_by_type = await get_ticket_count(ticket_type);
        const new_ticket_number = current_ticket_count_by_type + 1;
        const channel_name = `${ticket_type}-ticket-${new_ticket_number}`;
        const categories = require('../embeds/static_embeds.json').ticket.categories;
        const category_id = categories[ticket_type];
        if (!category_id) {
            category_id = null;
        }
        const channel = await guild.channels.create({
            name: channel_name,
            type: ChannelType.GuildText,
            parent: category_id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                },
            ],
        });
        const user_id = user.id;
        const channel_id = channel.id;
        await save_ticket_to_db(user_id, channel_id, ticket_type, responses);
        const description = `Thank you for opening a ${ticket_type} ticket.\n` +
                            `A member of staff will be with you as soon as possible.\n\n` +
                            `Our support times are as follows:\n\n` +
                            `Monday - Friday: 10 AM - 10 PM (GMT)\n\n` + 
                            `Please be aware if you open a ticket outside of our support hours there may be a slight wait, we apologies, we are humans too, we cannot be here 24/7 unfortunately.\n`;
        const response_embed = create_dynamic_embed({
            title: `New ${ticket_type.charAt(0).toUpperCase() + ticket_type.slice(1)} Ticket`,
            description: description,
            colour: '5098434',
            fields: responses,
            thumbnail: modal.user.displayAvatarURL(),
            image: 'https://media.discordapp.net/attachments/1170906290151768075/1171108033133301810/boii_masc_be_patient.png',
            timestamp: true,
            footer: {
                text: bot_config.footer_text || "",
                iconURL: bot_config.footer_icon || ""
            },
        });
        const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close')
            .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(closeButton);
        await channel.send({ embeds: [response_embed], components: [row] });
        await channel.send(`Welcome ${user}, a staff member will be with you as soon as possible. If you need to close your ticket for any reason you can so by clicking the close button above.`);
    } catch (error) {
        console.error("Error creating ticket channel:", error.message);
    }
    await modal.reply({ content: 'Your ticket has been created!' });
}

// Function to generate a ticket transcript
async function generate_ticket_transcript(channel_id, client) {
    const channel = await client.channels.fetch(channel_id);
    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted_messages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    let transcript = '';
    sorted_messages.forEach(message => {
        transcript += `${message.author.tag} (${message.createdAt.toISOString()}): ${message.content}\n`;
    });
    return transcript;
}

// Function to handle 'Close' button clicks
async function handle_close_button(interaction) {
    if (interaction.customId === 'close_ticket') {
        const transcript = await generate_ticket_transcript(interaction.channel.id, interaction.client);
        await close_ticket(interaction.channel.id, transcript);
        await interaction.update({ content: 'Ticket closed successfully. This channel will be deleted shortly.', components: [] });
        setTimeout(() => {
            interaction.channel.delete('Ticket closed');
        }, 5000);
    }
}

// Exports
module.exports = {
    send_ticket_embed,
    generate_ticket_transcript,
    handle_ticket_modal,
    handle_ticket_button,
    handle_close_button
};