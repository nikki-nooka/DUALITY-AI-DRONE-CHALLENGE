const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { logUserAction } = require('../utils/logger');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    const { user_name, user_password, user_type } = req.body;

    try {
        // Find the user by username and type
        const user = await User.findOne({ user_name, user_type });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        let isValidPassword = false;

        // Password verification
        if (user.user_type === 'volunteer') {
            // Compare hashed password
            isValidPassword = await bcrypt.compare(user_password, user.user_password);
        } else {
            // Admins: direct comparison (if not hashed)
            isValidPassword = user_password === user.user_password;
        }

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update list of visits if not already present
        const currentMonthYear = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
        const visitExists = user.list_of_visits.some(visit => visit.timestamp === currentMonthYear);

        if (!visitExists) {
            user.list_of_visits.push({ timestamp: currentMonthYear });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, user_type: user.user_type }, 'your_jwt_secret');

        // Log the successful login
        await logUserAction(user._id, `${user.user_type} login successful`);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                user_name: user.user_name,
                user_type: user.user_type
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;
