// Function to set a reminder
function set_reminder(user_id, reminder_text, time_ms, channel, client) {
    setTimeout(async () => {
        try {
            const reminder_channel = await client.channels.fetch(channel.id);
            await reminder_channel.send(
                `Hi <@${user_id}>, you asked me to remind you: "${reminder_text}".\nHere's your reminder! 🌟`
            );
        } catch (error) {
            console.error(`Failed to send reminder to user ${user_id} in channel ${channel.id}:`, error);
        }
    }, time_ms);
}

// Exports
module.exports = {
    set_reminder
};
