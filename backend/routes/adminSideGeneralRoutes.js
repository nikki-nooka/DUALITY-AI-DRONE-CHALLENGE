const moongoose = require('mongoose');
const express = require('express');

const router = express.Router();
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const User = require('../models/userModel');
const Medicine = require('../models/inventoryModel');
const MedicineCategory = require('../models/medicineCategoryModel');
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

// router.post('/add_doctor', async (req, res) => {
//     const { doctor_name, doctor_email, doctor_phone_no, doctor_age, specialization, doctor_sex } = req.body;

//     const doctors = await Doctor.find();
//     let doctor_id = 1;

//     while (doctors.find((doctor) => doctor.doctor_id === doctor_id)) {
//         doctor_id++;
//     }

//     const doctor = new Doctor({
//         'doctor_id': doctor_id,
//         'doctor_name': doctor_name,
//         'doctor_email': doctor_email,
//         'doctor_age': doctor_age,
//         'doctor_phone_no': doctor_phone_no,
//         'specialization': specialization,
//         'doctor_sex': doctor_sex,
//         'doctor_availability': false
//     })

//     try {
//         await doctor.save();
//         res.send(doctor);
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Error while adding a doctor');
//     }
// });

// router.delete('/delete_doctor/:id', async (req, res) => {
//     const id = req.params.id;
//     const doctor = await Doctor.findByIdAndDelete(id);
//     if (!doctor) {
//         res.status(404).send('Doctor not found');
//     }
//     res.send(doctor);
// });

// router.put('/update_doctor_availability/:id', async (req, res) => {
//     const id = req.params.id;
//     const doctor = await Doctor.findById(id);
//     if (!doctor) {
//         res.status(404).send('Doctor not found');
//     }
//     doctor.doctor_availability = req.body.doctor_availability;
//     await doctor.save();
//     res.json(doctor);
// }
// );

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

// router.post('/update_medicine_stock', async (req, res) => {
//     const { medicine_id, expiry_date, quantity } = req.body;
//     try {
//         const medicine = await Medicine.findOne({ medicine_id: medicine_id });
//         if (!medicine) {
//             return res.status(404).send('Medicine not found');
//         }

//         let found = false;
//         for (let i = 0; i < medicine.medicine_details.length; i++) {
//             const detail = medicine.medicine_details[i];
//             const detailDate = new Date(detail.expiry_date).toISOString().split('T')[0];
//             const requestDate = new Date(expiry_date).toISOString().split('T')[0];
            
//             if (detailDate === requestDate) {
//                 medicine.medicine_details[i].quantity = quantity;
//                 found = true;
//                 break;
//             }
//         }

//         if (!found) {
//             return res.status(404).send('Medicine with the expiry date not found');
//         }

//         medicine.total_quantity = medicine.medicine_details.reduce(
//             (total, detail) => total + detail.quantity, 0
//         );

//         await medicine.save();
//         res.send(medicine);
//     } catch (error) {
//         console.error('Error updating medicine stock:', error);
//         res.status(500).send('Server error');
//     }
// });

// router.post('/add_new_medicine_details', async (req, res) => {
//     const { medicine_id, medicine_name, expiry_date, quantity } = req.body;
    
//     try {
//       const medicine = await Medicine.findOne({ medicine_id });
//       if (!medicine) {
//         return res.status(404).send('Medicine not found');
//       }
  
//       medicine.medicine_details.push({
//         medicine_name,
//         expiry_date,
//         quantity
//       });
  
//       medicine.total_quantity += quantity;
  
//       await medicine.save();
  
//       res.status(200).json(medicine);
//     } catch (error) {
//       console.error('Error adding medicine details:', error);
//       res.status(500).send('Server error');
//     }
//   });

// const addMedicine = async (req, res) => {
//     try {
//         const {
//             medicine_formulation,
//             medicine_name,
//             expiry_date,
//             quantity
//         } = req.body;
//         console.log(req.body);

//         if (!medicine_formulation || !medicine_name || !expiry_date || !quantity) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }


//         const existingMedicine = await Medicine.findOne({ medicine_formulation });

//         if (existingMedicine) {
//             return res.status(400).json({ message: 'Medicine with this formulation already exists' });
//         } else {
//             let medicine_id = 1;
//             const medicines = await Medicine.find();
//             while (medicines.find((medicine) => medicine.medicine_id === medicine_id.toString())) {
//                 medicine_id++;
//             }
//             const newMedicine = new Medicine({
//                 medicine_id: medicine_id.toString(),
//                 medicine_formulation,
//                 total_quantity: quantity,
//                 medicine_details: [{
//                     medicine_name,
//                     expiry_date,
//                     quantity
//                 }]
//             });

//             await newMedicine.save();
//             return res.status(201).json({
//                 message: 'New medicine added to inventory',
//                 medicine: newMedicine
//             });
//         }
//     } catch (error) {
//         console.error('Error adding medicine:', error);
//         return res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };
// router.post('/add_new_medicine', addMedicine);


// router.get('/get_medicines', async (req, res) => {
//     try {
//         const medicines = await Medicine.find();
//         console.log(medicines[0].medicine_details[0].expiry_date);
//         res.json(medicines);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error retrieving medicines');
//     }
// });

// router.get('/get_doctors', async (req, res) => {
//     try {
//         const doctors = await Doctor.find({});
//         res.json(doctors);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error retrieving doctors');
//     }
// });

router.get('/get_patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving patients');
    }
});

router.get('/get_volunteers', async (req, res) => {
    try {
        const volunteers = await User.find({ user_type: 'volunteer' });
        res.json(volunteers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving volunteers');
    }
});

// router.get('/get_medicine/:id', async (req, res) => {
//     const id = req.params.id;
//     try {
//         const medicine = await Medicine.find({ medicine_id: id });
//         if (!medicine) {
//             res.status(404).send('Medicine not found');
//         }
//         res.json(medicine);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error retrieving medicine');
//     }
// });

module.exports = router;