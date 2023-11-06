// Function to parse duration into seconds, mins, hours, days
const parse_duration = (duration_str) => {
    const duration = parseInt(duration_str.slice(0, -1));
    const unit = duration_str.slice(-1);
    switch(unit) {
        case 's':
            return duration * 1000;
        case 'm':
            return duration * 60 * 1000;
        case 'h':
            return duration * 60 * 60 * 1000;
        case 'd':
            return duration * 24 * 60 * 60 * 1000;
        default:
            throw new Error('Invalid duration unit.');
    }
};

// Parse fields from a comma-separated string
function parse_fields(fields_str) {
    const items = fields_str.split(',').map(item => item.trim());
    const fields = [];
    for (let i = 0; i < items.length; i += 2) {
        if (i + 1 < items.length) {
            fields.push({
                name: items[i],
                value: items[i + 1]
            });
        } else {
            return null;
        }
    }
    return fields;
}

// Exports
module.exports = {
    parse_duration,
    parse_fields
};