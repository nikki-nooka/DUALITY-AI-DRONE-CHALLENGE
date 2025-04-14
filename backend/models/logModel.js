const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    user_id: { type: Number, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, required: true } // Using Date type for date-time format
});

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;