const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

/**
 * @route   POST /api/admin/add_volunteer
 * @desc    Create a new volunteer
 * @access  Admin
 */
router.post('/add_volunteer', async (req, res) => {
    try {
        const { 
            user_name, 
            user_phone_no, 
            user_email, 
            user_age,
            user_password 
        } = req.body;
        
        // Check if required fields are provided
        if (!user_name || !user_password || !user_phone_no || !user_email || !user_age) {
            return res.status(400).json({ 
                message: 'All fields are required: username, password, phone number, email, and age' 
            });
        }
        
        // Check if username or email already exists
        const existingUser = await User.findOne({ 
            $or: [{ user_name }, { user_email }] 
        });
        
        if (existingUser) {
            if (existingUser.user_name === user_name) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            if (existingUser.user_email === user_email) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        // Generate auto-incremented user_id
        // Find the highest user_id and increment by 1
        const highestUser = await User.findOne().sort('-user_id');
        const nextUserId = highestUser ? highestUser.user_id + 1 : 1;
        
        // Create new volunteer user
        const newVolunteer = new User({
            user_id: nextUserId,
            user_name,
            user_phone_no,
            user_email,
            user_age,
            user_password,
            user_type: 'volunteer',
            list_of_visits: [] // Initialize with empty visits array
        });
        
        await newVolunteer.save();
        
        // Return success without sending back the password
        const volunteerResponse = newVolunteer.toObject();
        delete volunteerResponse.user_password;
        
        res.status(201).json({
            message: 'Volunteer created successfully',
            volunteer: volunteerResponse
        });
    } catch (error) {
        console.error('Error adding volunteer:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/admin/get_volunteers
 * @desc    Get all volunteers
 * @access  Admin
 */
router.get('/get_volunteers', async (req, res) => {
    try {
        const volunteers = await User.find({ user_type: 'volunteer' })
            .select('-user_password') // Exclude password from results
            .sort('user_id'); // Sort by user_id
        
        res.status(200).json(volunteers);
    } catch (error) {
        console.error('Error fetching volunteers:', error);
        res.status(500).json({ message: 'Error retrieving volunteers', error: error.message });
    }
});

/**
 * @route   GET /api/admin/get_volunteer/:id
 * @desc    Get a specific volunteer by ID
 * @access  Admin
 */
router.get('/get_volunteer/:id', async (req, res) => {
    try {
        const volunteer = await User.findById(req.params.id)
            .select('-user_password');
        
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        
        if (volunteer.user_type !== 'volunteer') {
            return res.status(400).json({ message: 'User is not a volunteer' });
        }
        
        res.status(200).json(volunteer);
    } catch (error) {
        console.error('Error fetching volunteer:', error);
        res.status(500).json({ message: 'Error retrieving volunteer', error: error.message });
    }
});

/**
 * @route   POST /api/admin/delete_volunteers
 * @desc    Delete multiple volunteers
 * @access  Admin
 */
router.post('/delete_volunteers', async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Valid volunteer IDs array is required' });
        }
        
        const result = await User.deleteMany({
            _id: { $in: ids },
            user_type: 'volunteer'
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No volunteers found with the provided IDs' });
        }
        
        res.status(200).json({
            message: `${result.deletedCount} volunteers deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting volunteers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   POST /api/admin/delete_volunteer/:id
 * @desc    Delete a specific volunteer
 * @access  Admin
 */
router.post('/delete_volunteer/:id', async (req, res) => {
    try {
        const volunteer = await User.findById(req.params.id);
        
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        
        if (volunteer.user_type !== 'volunteer') {
            return res.status(400).json({ message: 'User is not a volunteer' });
        }
        
        await User.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   POST /api/admin/edit_volunteer/:id
 * @desc    Update a volunteer's information
 * @access  Admin
 */
router.post('/edit_volunteer/:id', async (req, res) => {
    try {
        const volunteer = await User.findById(req.params.id);
        
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        
        if (volunteer.user_type !== 'volunteer') {
            return res.status(400).json({ message: 'User is not a volunteer' });
        }
        
        // Fields that can be updated
        const { user_name, user_phone_no, user_email, user_age, user_password } = req.body;
        
        // Check if email exists if trying to change it
        if (user_email && user_email !== volunteer.user_email) {
            const existingUser = await User.findOne({ user_email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        
        // Check if username exists if trying to change it
        if (user_name && user_name !== volunteer.user_name) {
            const existingUser = await User.findOne({ user_name });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
        }
        
        // Update only provided fields
        if (user_name) volunteer.user_name = user_name;
        if (user_phone_no) volunteer.user_phone_no = user_phone_no;
        if (user_email) volunteer.user_email = user_email;
        if (user_age) volunteer.user_age = user_age;
        if (user_password) volunteer.user_password = user_password;
        
        // Save updated volunteer
        await volunteer.save();
        
        // Return updated volunteer without password
        const volunteerResponse = volunteer.toObject();
        delete volunteerResponse.user_password;
        
        res.status(200).json({
            message: 'Volunteer updated successfully',
            volunteer: volunteerResponse
        });
    } catch (error) {
        console.error('Error updating volunteer:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;