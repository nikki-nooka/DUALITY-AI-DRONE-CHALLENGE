const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const PatientHistory = require('../models/patientHistoryModel');
const { logUserAction } = require('../utils/logger');

// Fetch all doctors
router.get('/get_doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({doctor_availability: true}); // Fetch all doctors from the database
    
    // Log successful retrieval of available doctors
    if (req._user && req._user.id) {
      await logUserAction(
        req._user.id,
        `Retrieved list of available doctors (${doctors.length} doctors)`
      );
    }
    
    return res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Assign a doctor to a patient
router.post('/', async (req, res) => {
  const { book_no, doc_name } = req.body;

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

    // Store previous doctor ID for logging if one exists
    const previousDoctorId = patientHistory.visits[visitIndex].doctor_id;
    
    // Assign the doctor
    patientHistory.visits[visitIndex].doctor_id = doc_id;
    await patientHistory.save();
    
    // Log successful doctor assignment
    if (req._user && req._user.id) {
      // Build an informative log message
      let logMessage = `Assigned doctor ${doc_name} (ID: ${doc_id}) to patient with book number ${book_no} for ${currentMonthYear}`;
      
      // If there was a previous doctor, include that in the log
      if (previousDoctorId) {
        logMessage += ` (replacing doctor ID: ${previousDoctorId})`;
      }
      
      await logUserAction(req._user.id, logMessage);
    }

    return res.status(200).send({ message: 'Doctor assigned successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(400).send({ message: error.message });
  }
});

module.exports = router;