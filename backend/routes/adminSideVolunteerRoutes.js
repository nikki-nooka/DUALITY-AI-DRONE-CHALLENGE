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
        const { user_name, user_password, user_fullname, user_email, user_phone, user_address } = req.body;
        
        // Check if required fields are provided
        if (!user_name || !user_password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Check if username already exists
        const existingUser = await User.findOne({ user_name });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Create new volunteer user
        const newVolunteer = new User({
            user_name,
            user_password,
            user_fullname: user_fullname || '',
            user_email: user_email || '',
            user_phone: user_phone || '',
            user_address: user_address || '',
            user_type: 'volunteer'
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
            .select('-user_password'); // Exclude password from results
        
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
 * @route   DELETE /api/admin/delete_volunteers
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
 * @route   DELETE /api/admin/delete_volunteer/:id
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
 * @route   PUT /api/admin/edit_volunteer/:id
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
        const { user_fullname, user_email, user_phone, user_address, user_password } = req.body;
        
        // Check if username exists if trying to change it
        if (req.body.user_name && req.body.user_name !== volunteer.user_name) {
            const existingUser = await User.findOne({ user_name: req.body.user_name });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            volunteer.user_name = req.body.user_name;
        }
        
        // Update only provided fields
        if (user_fullname !== undefined) volunteer.user_fullname = user_fullname;
        if (user_email !== undefined) volunteer.user_email = user_email;
        if (user_phone !== undefined) volunteer.user_phone = user_phone;
        if (user_address !== undefined) volunteer.user_address = user_address;
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