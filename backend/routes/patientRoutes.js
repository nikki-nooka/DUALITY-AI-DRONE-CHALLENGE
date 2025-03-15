const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel');
const PatientHistory = require('../models/patientHistoryModel');

router.post('/', async (req, res) => {
  const { book_no, patient_name, patient_age, patient_sex, patient_phone_no, patient_area, oldNew, eid } = req.body;
    console.log ('Received data:', req.body)
  try {
    if (oldNew === 'old') {
      const existingPatient = await Patient.findOne({ book_no });
      console.log('Existing patient:', existingPatient);

      if (existingPatient) {
        const patientHistory = await PatientHistory.findOne({ book_no });
        console.log('Patient history:', patientHistory);

        if (patientHistory) {
          patientHistory.visits.push({timestamp: new Date().toISOString().slice(0, 7) });
          await patientHistory.save();
          return res.status(200).send({ message: 'Patient data found and visit updated' });
        } else {
          const newPatientHistory = new PatientHistory({
            book_no,
            visits: [{ timestamp: new Date().toISOString().slice(0, 7) }]
          });
          await newPatientHistory.save();
          return res.status(200).send({ message: 'Patient data found and visit updated' });
        }
      } else {
        return res.status(404).send({ message: 'Patient data not found. Make a new registration' });
      }
    } else {
      const newPatient = new Patient({
        book_no,
        patient_name,
        patient_age,
        patient_sex,
        patient_phone_no,
        patient_area
      });
      await newPatient.save();

      const newPatientHistory = new PatientHistory({
        book_no,
        visits: [{ timestamp: new Date().toISOString().slice(0, 7) }]
      });
      await newPatientHistory.save();

      return res.status(201).send({ message: 'New patient registered successfully' });
    }
  } catch (error) {
    return res.status(400).send(error);
  }
});

module.exports = router;