# Discord Bot

Just a simple open source bot to help out with your server life.
Bot was created entirely for the purpose of replacing the premium features of bots we use over at BOII | Development, it will be updated as time progresses.
Since I don't like taking too much time out from the work projects to work on personal projects, decided to just put this up here if you want to use feel free.

## Features

- **Ticket System**: Enables users to create tickets with support for transcript saving.
- **Giveaways**: Facilitates hosting and managing giveaways within the server.
- **Polls**: Allows you to engage your community by conducting polls.
- **Reminders**: Offers a feature for users to set reminders for important events or tasks.
- **Role Reactions**: Automates role assignment based on user reactions to specific messages.

I plan to add more features and refine existing ones over time as the needs of our servers change.

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v12.0.0 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

You also need to create yourself a bot here:
- [Discord Developer Portal](https://discord.com/developers/applications)

### Installation

To install the bot, follow these steps:

#### Clone the repository

```bash
git clone https://github.com/CaseIRL/discord_bot.git
cd discord_bot
```

#### Install dependencies

```bash
npm init -y
npm install discord.js
npm install mysql2
```

### Setup

Configure the bot by renaming and updating the example configuration files with your specific details.

- Rename `config.json.example` to `config.json` and update it with your bot's credentials.

```json
{
    "client_id": "YOUR_BOT_CLIENT_ID",
    "guild_id": "YOUR_SERVER_GUILD_ID",
    "token": "YOUR_BOT_TOKEN",
    "thumbnail": "LINK_TO_BOT_THUMBNAIL",
    "footer_text": "YOUR_CUSTOM_FOOTER_TEXT",
    "footer_icon": "LINK_TO_FOOTER_ICON",
    "clear_pool_on_dc": true,
    "save_ticket_transcripts_on_close": true
}
```

- Rename `database.json.example` to `database.json` and provide your database connection details.

```json
{
    "host": "YOUR_DATABASE_HOST",
    "user": "YOUR_DATABASE_USER",
    "database": "YOUR_DATABASE_NAME",
    "password": "YOUR_DATABASE_PASSWORD"
}
```

### Customisation

Customisation options are currently spread throughout the codebase, as this bot was initially created for in-house use. To customize:

- **Static Embeds**: Edit `static_embeds.json` for predefined messages like rules and tickets.
- **Commands**: Modify `commands.js` & `commands.json` to tweak bot commands.

For other customizations, you may need to search through the code to find the relevant sections.

### Usage

Interact with the bot using slash commands after setup and customization:

- **/rules**: Post the rules embed in a channel.
- **/tickets**: Display the ticket creation interface.
- **/giveaway**: Launch a giveaway with detailed options.
- **/poll**: Start a poll with a variety of options.
- **/reminder**: Set reminders for various timeframes.
- **/clear**: Bulk delete messages in a channel.

### Running the Bot

To start the bot:

```bash
npm start
```

This will boot up the bot and connect it to your Discord server using the provided token.

### Support

This bot is provided as-is, without direct support due to my current workload. While I'm unable to provide personal assistance, you're encouraged to utilize the community for help. Please refrain from opening support tickets in the BOII Discord for this bot.

Feel free to fork, adapt, and use this bot to your heart's content. Happy Discord management!
