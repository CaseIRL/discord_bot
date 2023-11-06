const { create_dynamic_embed } = require('../embeds/embeds');

const start_poll = async (interaction, title, description, fields_str, thumbnail, image) => {
    const items = fields_str.split(',').map(item => item.trim());
    let fields = [];
    const emojis = "🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿".split(" ");
    for (let i = 0; i < items.length; i += 2) {
        if (i + 1 < items.length) {
            fields.push({
                name: `${emojis[i / 2]} ${items[i]}`,
                value: items[i + 1],
                inline: false
            });
        }
    }
    const additional = thumbnail ? { thumbnail } : {};
    const poll_embed = create_dynamic_embed({ title, description, colour: '5098434', fields, image: image, ...additional });
    const sent_message = await interaction.channel.send({ embeds: [poll_embed] });
    try {
        for (let i = 0; i < fields.length; i++) {
            await sent_message.react(emojis[i]);
        }
        await interaction.deferReply({ ephemeral: true, content: "Poll created!" });
    } catch (error) {
        console.error('Failed to react with emojis for poll:', error);
        await sent_message.delete();
        await interaction.reply({ content: "Failed to create poll, please try again.", ephemeral: true });
    }
};

module.exports = {
    start_poll
};