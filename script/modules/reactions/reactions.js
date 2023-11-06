const { giveaway_messages, giveaway_participants } = require('../giveaways/giveaways');

// Function to handle giving roles for rules embed
const handle_rules_reaction_add = async (reaction, user, client) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(`Failed to fetch reaction: ${error}`);
            return;
        }
    }
    if (reaction.emoji.name === '✅' && !user.bot) {
        try {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const role = guild.roles.cache.get('1155177450913923092');
            const bot_member = guild.members.cache.get(client.user.id);
            if (!member || !role || !bot_member || !bot_member.permissions.has('MANAGE_ROLES')) {
                throw new Error('Error: Preconditions for adding a role are not met.');
            }
            if (role.position >= bot_member.roles.highest.position) {
                console.error(`Error: Bot cannot assign a role higher or equal to its highest role. User ID: ${user.id}`);
                return;
            }
            await member.roles.add(role, "Verified through reaction");
        } catch (error) {
            console.error(`Error: Rules reaction add for user ${user.id}: ${error}`);
        }
    }
};

// Function to remove roles for rules embed
const handle_rules_reaction_remove = async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(`Failed to fetch reaction: ${error}`);
            return;
        }
    }
    if (reaction.emoji.name === '✅' && !user.bot) {
        try {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id);
            const role = guild.roles.cache.get('1155177450913923092');
            if (!member || !role) {
                throw new Error('Error: Preconditions for removing a role are not met.');
            }
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role, "Unverified through reaction removal");
            }
        } catch (error) {
            console.error(`Error: Rules reaction remove for user ${user.id}: ${error}`);
        }
    }
};


// Function to add a user into giveaway participants when adding a reaction
const handle_giveaway_reaction_add = async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(`Error: Failed to fetch reaction: ${error}`);
            return;
        }
    }
    if (giveaway_messages.has(reaction.message.id) && !user.bot) {
        try {
            if (!giveaway_participants.has(reaction.message.id)) {
                giveaway_participants.set(reaction.message.id, new Set());
            }
            giveaway_participants.get(reaction.message.id).add(user.id);
        } catch (error) {
            console.error(`Error: Giveaway reaction add for user ${user.id}: ${error}`);
        }
    }
};

// Function to remove a user from giveaway participants when removing a reaction
const handle_giveaway_reaction_remove = async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error(`Error: Failed to fetch reaction: ${error}`);
            return;
        }
    }
    if (giveaway_messages.has(reaction.message.id) && !user.bot) {
        try {
            const participants = giveaway_participants.get(reaction.message.id);
            if (participants && participants.has(user.id)) {
                participants.delete(user.id);
            }
        } catch (error) {
            console.error(`Error: Giveaway reaction remove for user ${user.id}: ${error}`);
        }
    }
};

module.exports = {
    handle_rules_reaction_add,
    handle_rules_reaction_remove,
    handle_giveaway_reaction_add,
    handle_giveaway_reaction_remove
};