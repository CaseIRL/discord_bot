const { create_static_embed, create_dynamic_embed  } = require('../embeds/embeds');
const { parse_duration } = require('../utils/utils.js');

const giveaway_messages = new Set();
const giveaway_participants = new Map();

const start_giveaway = async (interaction, title, description, fields, reaction, winners, duration_str, end_time, thumbnail, img_1, img_2) => {
    const duration = parse_duration(duration_str);
    fields.push({
        name: 'End Time',
        value: end_time.toLocaleString(),
        inline: true
    });
    const giveaway_embed = create_dynamic_embed({
        title: title,
        description: description,
        colour: 5098434,
        fields: fields,
        image: img_1,
        timestamp: true,
        footer: { text: '© - BOII | Development' },
        thumbnail: thumbnail
    });
    const sent_message = await interaction.channel.send({ embeds: [giveaway_embed] });
    sent_message.react(reaction);
    giveaway_messages.add(sent_message.id);
    await interaction.deferReply({ ephemeral: true, content: "Giveaway started!" });
    setTimeout(async () => {
        const winner_list = await pick_winners(sent_message.id, winners);
        if (!Array.isArray(winner_list)) {
            console.error(`Expected winner_list to be an array, but got ${typeof winner_list}. Value:`, winner_list);
            return;
        }
        if (winner_list.length === 0) {
            const no_participants_embed = create_static_embed('no_participants');
            await interaction.channel.send({ embeds: [no_participants_embed] });
            return;
        }
        const winner_mentions = winner_list.map(id => `<@${id}>`).join(', ');
        const winners_embed = create_dynamic_embed({
            title: 'Giveaway Winners!',
            description: `Congratulations to ${winner_mentions} for winning the giveaway!`,
            colour: 5098434,
            thumbnail: thumbnail,
            image: img_2,
            footer: {
                text: '© - BOII | Development',
                iconURL: thumbnail
            }
        });
        await interaction.channel.send({ embeds: [winners_embed] });
        console.log(`Giveaway ended! Winners: ${winner_mentions}`);
    }, duration);
};


// Function to pick winners from participants
const pick_winners = async (message_id, winners) => {
    const participants_set = giveaway_participants.get(message_id);
    const participants = participants_set ? Array.from(participants_set) : [];
    if (participants.length === 0) {
        return [];
    }
    const num_winners = Math.min(winners, participants.length);
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const giveaway_winners = shuffled.slice(0, num_winners);
    return giveaway_winners;
}

// Exports
module.exports = {
    start_giveaway,
    giveaway_messages,
    giveaway_participants,
    pick_winners
};
