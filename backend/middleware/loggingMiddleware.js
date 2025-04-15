const moongoose = require('mongoose');
const Log = require('../models/logModel');
const User = require('../models/userModel');

const loggingMiddleware = async (req, res, next) => {
    try {
        const user_id = req.body.user_id;
        const action = req.method + ' ' + req.originalUrl;
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if(!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Check if the user_id is valid (exists in the database)
        const user = await User.findOne({ user_id: user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the action
        const logEntry = new Log({
            user_id: user_id,
            action: action,
            timestamp: timestamp
        });
        await logEntry.save();

    } catch (error) {
        console.error('Logging error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return; // Prevent further execution
    }
    
    next();
}

module.exports = loggingMiddleware;