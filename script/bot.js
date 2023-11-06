const { Client, GatewayIntentBits, Events } = require('discord.js');
const { token, guild_id, clear_pool_on_dc } = require('./config.json');
const { check_database_connection } = require('./modules/database/database');
const { init_commands, handle_interaction } = require('./modules/commands/commands');
const { handle_rules_reaction_add, handle_rules_reaction_remove, handle_giveaway_reaction_add, handle_giveaway_reaction_remove } = require('./modules/reactions/reactions');
const { handle_ticket_modal, handle_ticket_button, handle_close_button } = require('./modules/tickets/tickets');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    check_database_connection();
    await init_commands(client, guild_id);
});

client.on('messageReactionAdd', (reaction, user) => {
    handle_rules_reaction_add(reaction, user, client);
    handle_giveaway_reaction_add(reaction, user);
});

client.on('messageReactionRemove', (reaction, user) => {
    handle_rules_reaction_remove(reaction, user, client);
    handle_giveaway_reaction_remove(reaction, user);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        await handle_interaction(interaction, client);
    } else if (interaction.isButton()) {
        switch (interaction.customId) {
            case 'close_ticket':
                await handle_close_button(interaction);
                break;
            default:
                await handle_ticket_button(interaction);
                break;
        }
    } else if (interaction.isModalSubmit()) {
        await handle_ticket_modal(interaction);
    }
});

client.login(token);
client.on('disconnect', () => {
    if (clear_pool_on_dc) {
        pool.end();
        console.log('Bot disconnected. Database connection dropped');
    }
});