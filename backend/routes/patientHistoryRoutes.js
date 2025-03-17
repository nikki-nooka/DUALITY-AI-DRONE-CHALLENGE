const express = require('express');
const router = express.Router();
const PatientHistory = require('../models/patientHistoryModel');

router.post('/doctor-prescription', async (req, res) => {
  try {
    const { book_no, prescriptions } = req.body;

    if (!book_no || !prescriptions || !Array.isArray(prescriptions)) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    const currentMonthYear = new Date().toISOString().slice(0, 7);
    let patientHistory = await PatientHistory.findOne({ book_no });

    if (!patientHistory) {
      patientHistory = new PatientHistory({
        book_no,
        visits: [{
          timestamp: currentMonthYear,
          medicines_prescribed: prescriptions,
          medicines_given: []
        }]
      });
    } else {
      let visit = patientHistory.visits.find(visit => visit.timestamp === currentMonthYear);
      
      if (!visit) {
        patientHistory.visits.push({
          timestamp: currentMonthYear,
          medicines_prescribed: prescriptions,
          medicines_given: []
        });
      } else {
        visit.medicines_prescribed = [...visit.medicines_prescribed, ...prescriptions];
      }
    }

    await patientHistory.save();
    return res.status(200).json({ message: 'Prescription added successfully!' });
  } catch (error) {
    console.error('Error in doctor prescription route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.get('/medicine-pickup/:book_no', async (req, res) => {
  try {
    const { book_no } = req.params;
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const patientHistory = await PatientHistory.findOne({ book_no });

    if (!patientHistory) {
      return res.status(404).json({ message: 'No prescription found for this book number.' });
    }

    let visit = patientHistory.visits.find(visit => visit.timestamp === currentMonthYear);
    if (!visit || !visit.medicines_prescribed.length) {
      return res.status(404).json({ message: 'No medicines prescribed for this month.' });
    }

    return res.status(200).json({ medicines_prescribed: visit.medicines_prescribed });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/medicine-pickup', async (req, res) => {
  try {
    const { book_no, medicinesGiven } = req.body;
    
    if (!book_no || !medicinesGiven || !Array.isArray(medicinesGiven)) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    let patientHistory = await PatientHistory.findOne({ book_no });

    if (!patientHistory) {
      return res.status(404).json({ message: 'Patient history not found.' });
    }

    const currentMonthYear = new Date().toISOString().slice(0, 7);
    let visitIndex = patientHistory.visits.findIndex(visit => visit.timestamp === currentMonthYear);

    if (visitIndex === -1) {
      return res.status(404).json({ message: 'No prescription found for this month.' });
    }

    patientHistory.visits[visitIndex].medicines_prescribed =
      patientHistory.visits[visitIndex].medicines_prescribed.filter(
        (med) => !medicinesGiven.some((given) => given.medicine_id === med.medicine_id)
      );

    patientHistory.visits[visitIndex].medicines_given.push(...medicinesGiven);

    await patientHistory.save();

    return res.status(200).json({ message: 'Medicine pickup recorded successfully!' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
