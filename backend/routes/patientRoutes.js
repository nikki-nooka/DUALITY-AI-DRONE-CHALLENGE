const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel');
const PatientHistory = require('../models/patientHistoryModel');

// GET route to fetch patient data by book number
router.get('/:book_no', async (req, res) => {
  const { book_no } = req.params;
  try {
    const patient = await Patient.findOne({ book_no });
    if (patient) {
      return res.status(200).send(patient);
    } else {
      return res.status(404).send({ message: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return res.status(500).send({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { book_no, patient_name, patient_age, patient_sex, patient_phone_no, patient_area, oldNew, eid } = req.body;
  console.log('Received data:', req.body);
  try {
    const existingPatient = await Patient.findOne({ book_no });

    if (existingPatient) {
      // Update existing patient data
      existingPatient.patient_name = patient_name || existingPatient.patient_name;
      existingPatient.patient_age = patient_age || existingPatient.patient_age;
      existingPatient.patient_sex = patient_sex || existingPatient.patient_sex;
      existingPatient.patient_phone_no = patient_phone_no || existingPatient.patient_phone_no;
      existingPatient.patient_area = patient_area || existingPatient.patient_area;

      await existingPatient.save();

      // Add or update patient history
      const patientHistory = await PatientHistory.findOne({ book_no });
      if (patientHistory) {
        patientHistory.visits.push({ timestamp: new Date().toISOString().slice(0, 7) });
        await patientHistory.save();
      } else {
        const newPatientHistory = new PatientHistory({
          book_no,
          visits: [{ timestamp: new Date().toISOString().slice(0, 7) }]
        });
        await newPatientHistory.save();
      }

      // return res.status(200).send({ message: 'Patient data updated successfully and visit recorded' });
      return res.status(200).json({ 
        message: 'Patient data updated successfully and visit recorded', 
        redirect: true 
      });
    } else {
      // Create new patient data
      const newPatient = new Patient({
        book_no,
        patient_name,
        patient_age,
        patient_sex,
        patient_phone_no,
        patient_area
      });
      await newPatient.save();

      // Add patient history
      const newPatientHistory = new PatientHistory({
        book_no,
        visits: [{ timestamp: new Date().toISOString().slice(0, 7) }]
      });
      await newPatientHistory.save();
      return res.status(201).json({ 
        message: 'New patient registered successfully and visit recorded', 
        redirect: true 
      });
      // return res.status(201).send({ message: 'New patient registered successfully and visit recorded' });
    }
  } catch (error) {
    console.error('Error saving patient data:', error);
    return res.status(500).send({ message: 'Server error' });
  }
});

module.exports = router;