const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { user_name, user_password, user_type } = req.body;

    try {
        const user = await User.findOne({ user_name, user_password, user_type });
        if (user) {
            const token = jwt.sign({ id: user._id, user_type: user.user_type }, 'your_jwt_secret', { expiresIn: '7d' });
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;