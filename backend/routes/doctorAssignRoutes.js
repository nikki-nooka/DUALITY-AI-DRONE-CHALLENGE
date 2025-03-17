const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const PatientHistory = require('../models/patientHistoryModel');

router.post('/', async (req, res) => {
  const { book_no, doc_name } = req.body;
  console.log('Received data:', req.body);

  try {
    const doctor = await Doctor.findOne({ doctor_name: doc_name });
    if (!doctor) {
      return res.status(404).send({ message: 'Doctor not found' });
    }

    const doc_id = doctor.doctor_id;
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const patientHistory = await PatientHistory.findOne({ book_no });
    if (!patientHistory) {
      return res.status(404).send({ message: 'Patient history not found' });
    }

    const visitIndex = patientHistory.visits.findIndex(visit => visit.timestamp === currentMonthYear);
    if (visitIndex === -1) {
      return res.status(404).send({ message: 'Visit not found for the current month and year' });
    }

    patientHistory.visits[visitIndex].doctor_id = doc_id;
    await patientHistory.save();

    return res.status(200).send({ message: 'Doctor assigned successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(400).send({ message: error.message });
  }
});

module.exports = router;