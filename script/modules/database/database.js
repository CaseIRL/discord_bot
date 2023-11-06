const mysql = require('mysql2/promise');
const db_config = require('./database.json');

// DB pool settings
const pool = mysql.createPool({
    host: db_config.host,
    user: db_config.user,
    database: db_config.database,
    password: db_config.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test function to confirm database connection
const check_database_connection = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("Connected to the database successfully!");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    } finally {
        if (connection) connection.release();
    }
};

// Function to create sql tabel on first load if not exists
async function create_ticket_table() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            channel_id VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
            transcript TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            closed_at TIMESTAMP NULL DEFAULT NULL
        );
    `;
    try {
        await pool.execute(createTableSQL);
        console.log("Ensured that tickets table exists!");
    } catch (error) {
        console.error("Error ensuring tickets table exists:", error.message);
    }
}
create_ticket_table();

// Function to close a ticket
async function close_ticket(channel_id, transcript) {
    const shouldSaveTranscript = db_config.save_ticket_transcripts_on_close;
    try {
        if (shouldSaveTranscript) {
            await pool.execute(
                'UPDATE tickets SET status = ?, closed_at = NOW(), transcript = ? WHERE channel_id = ?',
                ['CLOSED', transcript, channel_id]
            );
        } else {
            await pool.execute(
                'UPDATE tickets SET status = ?, closed_at = NOW() WHERE channel_id = ?',
                ['CLOSED', channel_id]
            );
        }
        console.log(`Ticket with channel ID: ${channel_id} marked as closed`);
    } catch (error) {
        console.error('Error closing ticket:', error.message);
    }
}

// Function to save a ticket to db
async function save_ticket_to_db(userId, channel_id, type) {
    try {
        await pool.execute(
            'INSERT INTO tickets (user_id, channel_id, type, status) VALUES (?, ?, ?, "OPEN")',
            [userId, channel_id, type]
        );
        console.log(`Saved ticket for user ID: ${userId} with channel ID: ${channel_id} and type: ${type}`);
    } catch (error) {
        console.error('Error saving ticket to database:', error.message);
    }
}

// Function to get count of tickets by type
async function get_ticket_count(type) {
    try {
        const [rows, fields] = await pool.query('SELECT COUNT(*) as count FROM tickets WHERE type = ?', [type]);
        return rows[0].count;
    } catch (error) {
        console.error('Error fetching ticket count by type:', error.message);
        return 0;
    }
}

// Function to get information for a ticket
async function get_ticket_info(channel_id) {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM tickets WHERE channel_id = ?', [channel_id]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching ticket info:', error.message);
        return null;
    }
}

// Function to create the embeds table
async function create_message_ids_table() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS embeds (
            id INT AUTO_INCREMENT PRIMARY KEY,
            embed_type VARCHAR(255) NOT NULL,
            message_id VARCHAR(255) NOT NULL,
            channel_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.execute(createTableSQL);
        console.log("Ensured that embeds table exists!");
    } catch (error) {
        console.error("Error ensuring embeds table exists:", error.message);
    }
}
create_message_ids_table();

// Function to save a message ID for a static embed
async function save_message_id(embed_type, message_id, channel_id) {
    try {
        await pool.execute(
            'INSERT INTO embeds (embed_type, message_id, channel_id) VALUES (?, ?, ?)',
            [embed_type, message_id, channel_id]
        );
        console.log(`Saved message ID for embed type: ${embed_type} with message ID: ${message_id}`);
    } catch (error) {
        console.error('Error saving message ID:', error.message);
    }
}

// Function to get a message ID for a static embed
async function get_message_id(embed_type, channel_id) {
    try {
        const [rows, fields] = await pool.query('SELECT message_id FROM embeds WHERE embed_type = ? AND channel_id = ?', [embed_type, channel_id]);
        if (rows.length > 0) {
            return rows[0].message_id;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching message ID:', error.message);
        return null;
    }
}

// Exports
module.exports = {
    pool,
    check_database_connection,
    close_ticket,
    get_ticket_info,
    save_ticket_to_db,
    get_ticket_count,
    save_message_id,
    get_message_id
};
