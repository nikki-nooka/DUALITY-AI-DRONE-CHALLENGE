const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { logUserAction } = require('../utils/logger');

router.post('/login', async (req, res) => {
    const { user_name, user_password, user_type } = req.body;

    try {
        const user = await User.findOne({ user_name, user_password, user_type });
        if (user) {
            // For admin and volunteer on login update the list of visits if not already present
            const currentMonthYear = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
                
            // Check if the current month-year already exists in the list
            const visitExists = user.list_of_visits.some(visit => visit.timestamp === currentMonthYear);
                
            if (!visitExists) {
                user.list_of_visits.push({ timestamp: currentMonthYear });
                await user.save();
            }

            //Remember that your using the user._id i.e., the MongoDB ObjectId as the id in the JWT token
            const token = jwt.sign({ id: user._id, user_type: user.user_type }, 'your_jwt_secret');
            // Log the successful login action
            const logEntry = await logUserAction(user._id, 'Login successful');
            res.status(200).json({ message: 'Login successful', token });

        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
