const moongoose = require('mongoose');
const express = require('express');

const router = express.Router();
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const User = require('../models/userModel');
const Medicine = require('../models/inventoryModel');
const MedicineCategory = require('../models/medicineCategoryModel');

router.post('/add_doctor', async (req, res) => {
    const { doctor_name, doctor_email, doctor_phone_no, doctor_age, specialization, doctor_sex } = req.body;

    // Check if the doctor already exists using phone number
    const existingDoctor = await Doctor.findOne({ doctor_phone_no });
    if (existingDoctor) {
        return res.status(400).send('Doctor with this phone number already exists');
    }
    
    // Only check for duplicate email if a non-empty email was provided
    if(doctor_email && doctor_email.trim() !== ''){
        const existingDoctor1 = await Doctor.findOne({ doctor_email });
        if (existingDoctor1) {
            return res.status(400).send('Doctor with this email already exists');
        }
    }

    const doctors = await Doctor.find();
    let doctor_id = 1;

    while (doctors.find((doctor) => doctor.doctor_id === doctor_id)) {
        doctor_id++;
    }

    // Set email to null if it's empty or not provided
    const sanitizedEmail = (doctor_email && doctor_email.trim() !== '') 
        ? doctor_email.trim() 
        : null;

    const doctor = new Doctor({
        'doctor_id': doctor_id,
        'doctor_name': doctor_name,
        'doctor_email': sanitizedEmail,
        'doctor_age': doctor_age,
        'doctor_phone_no': doctor_phone_no,
        'specialization': specialization,
        'doctor_sex': doctor_sex,
        'doctor_availability': false
    })

    try {
        await doctor.save();
        res.send(doctor);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error while adding a doctor');
    }
});

router.delete('/delete_doctor/:id', async (req, res) => {
    const id = req.params.id;
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
        res.status(404).send('Doctor not found');
    }
    res.send(doctor);
});

router.put('/update_doctor_availability/:id', async (req, res) => {
    const { id } = req.params;
    const { doctor_availability } = req.body;

    try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Update availability
        doctor.doctor_availability = doctor_availability;

        // If marking as available, append the current month and year to list_of_visits
        if (doctor_availability) {
            const currentTimestamp = new Date().toISOString().slice(0, 7); // YYYY-MM format
            if (!doctor.list_of_visits.some(visit => visit.timestamp === currentTimestamp)) {
                doctor.list_of_visits.push({ timestamp: currentTimestamp });
            }
        }

        await doctor.save();
        res.status(200).json(doctor);
    } catch (error) {
        console.error('Error updating doctor availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/get_doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving doctors');
    }
});

router.get('/get_doctor/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await Doctor.findById(id);
        if (doctor) {
            res.status(200).json(doctor);
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/edit_doctor/:id', async (req, res) => {
    try {
        console.log("Got edit doctor request");
        console.log(req.body);
        const id = req.params.id;
        
        // Find the doctor by ID
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Update fields from the request body
        if (req.body.doctor_name) doctor.doctor_name = req.body.doctor_name;
        if (req.body.doctor_email !== undefined) doctor.doctor_email = req.body.doctor_email;
        if (req.body.doctor_age !== undefined) doctor.doctor_age = req.body.doctor_age;
        if (req.body.doctor_phone_no) doctor.doctor_phone_no = req.body.doctor_phone_no;
        if (req.body.specialization) doctor.specialization = req.body.specialization;
        if (req.body.doctor_sex) doctor.doctor_sex = req.body.doctor_sex;
        
        // Save the updated doctor record
        await doctor.save();
        
        // Return the updated doctor
        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error updating doctor:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;