const express = require('express');
const router = express.Router();
const PatientHistory = require('../models/patientHistoryModel'); // Ensure the file name matches your model file

// POST endpoint for doctor prescription
router.post('/doctor-prescription', async (req, res) => {
  try {
    const { book_no, prescriptions } = req.body;
    if (!book_no || !prescriptions || !Array.isArray(prescriptions)) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    // Create a new visit entry; set doctor_id as needed.
    const visit = {
      doctor_id: 0, // Replace with actual doctor id if available
      timestamp: new Date().toISOString().slice(0, 7), // Format: "YYYY-MM"
      medicines_prescribed: prescriptions,
    };

    // Check if patient history already exists for the given book_no.
    let patientHistory = await PatientHistory.findOne({ book_no });
    if (patientHistory) {
      // Append the new visit
      patientHistory.visits.push(visit);
    } else {
      // Create new document if none exists
      patientHistory = new PatientHistory({
        book_no,
        visits: [visit],
      });
    }

    await patientHistory.save();
    return res.status(200).json({ message: 'Doctor prescription added successfully.' });
  } catch (error) {
    console.error('Error in doctor prescription route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
