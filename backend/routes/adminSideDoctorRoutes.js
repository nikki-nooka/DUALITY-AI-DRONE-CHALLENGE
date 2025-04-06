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
    const id = req.params.id;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
        res.status(404).send('Doctor not found');
    }
    doctor.doctor_availability = req.body.doctor_availability;
    await doctor.save();
    res.json(doctor);
}
);

router.get('/get_doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving doctors');
    }
});

module.exports = router;