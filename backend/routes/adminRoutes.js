const moongoose = require('mongoose');
const express = require('express');

const router = express.Router();
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const User = require('../models/userModel');
const Medicine = require('../models/inventoryModel');
const MedicineCategory = require('../models/medicineCategoryModel');

// Add a doctor
// There is a change in this function, auto create an id.
router.post('/add_doctor', async (req, res) => {
    // console.log(req.body);
    const { name, email, phone, age, specialization, sex } = req.body;
    // create an unique id, which is not present in the db.

    // Get all the doctor objects.
    const doctors = await Doctor.find();
    let doctor_id = 1;

    // Find the id, which is available
    while (doctors.find((doctor) => doctor.doctor_id === doctor_id)) {
        doctor_id++;
    }

    const doctor = new Doctor({
        'doctor_id': doctor_id,
        'doctor_name': name,
        'doctor_email': email,
        'doctor_age': age,
        'doctor_phone_no': phone,
        'specialization': specialization,
        'doctor_sex': sex,
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

// Delete a doctor
router.delete('/delete_doctor/:id', async (req, res) => {
    const id = req.params.id;
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
        res.status(404).send('Doctor not found');
    }
    res.send(doctor);
});

// Modify the availabilities of doctors
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

// Add a volunteer
router.post('/add_volunteer', async (req, res) => {
    const { name, email, phone, address, password } = req.body;
    const volunteer = new User({
        name,
        email,
        phone,
        address,
        password
    });
    try {
        await volunteer.save();
        res.send(volunteer);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error while adding a volunteer');
    }
})

// update the medicine stock
// request would have the medicine id and expiry_date,

router.post('/update_medicine_stock', async (req, res) => {
    const { medicine_id, expiry_date } = req.body;
    const medicine = await Medicine.findone({ medicine_id });
    if (!medicine) {
        res.status(404).send('Medicine not found');
    }

    // Find the exact expiry_date in the medicine_details array
    const med = medicine.medicine_details.find((med) => med.expiry_date === expiry_date);
    if (!med) {
        res.status(404).send('Medicine with the expiry date not found');
    }

    // Update the quantity of the medicine
    med.quantity = req.body.quantity;
    await medicine.save();
    res.send(medicine);

});

// Add a new medicine to the inventory
router.post('/add_new_medicine', async (req, res) => {
    const { medicine_name, medicine_details , medicine_category } = req.body;
    // create an unique id, which is not present in the db.

    // Get all the medicine objects.
    const medicines = await Medicine.find();
    let medicine_id = 1;

    // Find the id, which is available
    while (medicines.find((medicine) => medicine.medicine_id === medicine_id)) {
        medicine_id++;
    }

    const medicine = new Medicine({
        medicine_name,
        medicine_id,
        medicine_details
    });
    try {
        await medicine.save();
        // Now update the medicineCategory
        const medicineCategory = await MedicineCategory.findOne({ category: medicine_category });
        if (!medicineCategory) {
            res.status(404).send('Medicine Category not found');
        }
        medicineCategory.medicines.push(medicine_id);
        await medicineCategory.save();


        res.send(medicine);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error while adding a medicine');
    }
});


// Get all the medicines in the inventory
router.get('/get_medicines', async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving medicines');
    }
});

// Get all the doctors
router.get('/get_doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving doctors');
    }
});

// Get all the patients
router.get('/get_patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving patients');
    }
});

// Get all the volunteers
router.get('/get_volunteers', async (req, res) => {
    try {
        const volunteers = await User.find({ user_type: 'volunteer' });
        res.json(volunteers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving volunteers');
    }
});

module.exports = router;