const { EmbedBuilder } = require('discord.js');

// Function to create static embeds
const create_static_embed = (embed_type) => {
    const embed_content = require('./static_embeds.json')[embed_type];
    const embed = new EmbedBuilder()
        .setTitle(embed_content.title)
        .setDescription(embed_content.description)
        .setColor(parseInt(embed_content.colour, 10));
    if (embed_content.fields) embed.addFields(embed_content.fields);
    if (embed_content.thumbnail) embed.setThumbnail(embed_content.thumbnail);
    if (embed_content.image) embed.setImage(embed_content.image);
    if (embed_content.timestamp) embed.setTimestamp();
    if (embed_content.footer) embed.setFooter(embed_content.footer);
    if (embed_content.author) embed.setAuthor(embed_content.author);

    return embed;
};

// Function to create dynamic embeds
const create_dynamic_embed = (options) => {
    const embed = new EmbedBuilder();
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.colour) embed.setColor(parseInt(options.colour, 10));
    if (options.fields) embed.addFields(options.fields);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.timestamp) embed.setTimestamp();
    if (options.footer) embed.setFooter(options.footer);
    if (options.author) embed.setAuthor(options.author);
    if (options.additional) {
        embed.addFields(options.additional);
    }
    return embed;
};

// Exports
module.exports = {
    create_static_embed,
    create_dynamic_embed
};