const express = require('express');
const router = express.Router();
const PatientHistory = require('../models/patientHistoryModel'); // Ensure the file name matches your model file

// POST endpoint for doctor prescription
// router.post('/doctor-prescription', async (req, res) => {
//   try {
//     const { book_no, prescriptions } = req.body;
//     if (!book_no || !prescriptions || !Array.isArray(prescriptions)) {
//       return res.status(400).json({ message: 'Invalid data provided' });
//     }

//     // Create a new visit entry; set doctor_id as needed.
//     const visit = {
//       doctor_id: 0, // Replace with actual doctor id if available
//       timestamp: new Date().toISOString().slice(0, 7), // Format: "YYYY-MM"
//       medicines_prescribed: prescriptions,
//     };

//     // Check if patient history already exists for the given book_no.
//     let patientHistory = await PatientHistory.findOne({ book_no });
//     if (patientHistory) {
//       // Append the new visit
//       patientHistory.visits.push(visit);
//     } else {
//       // Create new document if none exists
//       patientHistory = new PatientHistory({
//         book_no,
//         visits: [visit],
//       });
//     }

router.post('/doctor-prescription', async (req, res) => {
  try {
    const { book_no, prescriptions } = req.body;

    if (!book_no || !prescriptions || !Array.isArray(prescriptions)) {
      return res.status(400).json({ message: 'Invalid data provided' });
    }

    const currentMonthYear = new Date().toISOString().slice(0, 7);
    let patientHistory = await PatientHistory.findOne({ book_no });

    if (!patientHistory) {
      // Create a new record if it doesn't exist
      patientHistory = new PatientHistory({
        book_no,
        visits: [{
          timestamp: currentMonthYear,
          medicines_prescribed: prescriptions,
          medicines_given: []
        }]
      });
    } else {
      // Find the visit for the current month
      let visit = patientHistory.visits.find(visit => visit.timestamp === currentMonthYear);
      
      if (!visit) {
        // If no visit exists for this month, create a new one
        patientHistory.visits.push({
          timestamp: currentMonthYear,
          medicines_prescribed: prescriptions,
          medicines_given: []
        });
      } else {
        // Merge new prescriptions with existing ones (avoid duplicates)
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


//     await patientHistory.save();
//     return res.status(200).json({ message: 'Doctor prescription added successfully.' });
//   } catch (error) {
//     console.error('Error in doctor prescription route:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// ===============[ NEW: GET CURRENT PRESCRIPTION FOR MEDICINE PICKUP ]===============
// Fetch prescription for medicine pickup
router.get('/medicine-pickup/:book_no', async (req, res) => {
  try {
    const { book_no } = req.params;
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const patientHistory = await PatientHistory.findOne({ book_no });

    if (!patientHistory) {
      return res.status(404).json({ message: 'No prescription found for this book number.' });
    }

    // Find the latest visit
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


// ===============[ NEW: POST MEDICINE PICKUP -> UPDATE medicines_given ]===============
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

    // Remove the picked-up medicines from the prescription
    patientHistory.visits[visitIndex].medicines_prescribed =
      patientHistory.visits[visitIndex].medicines_prescribed.filter(
        (med) => !medicinesGiven.some((given) => given.medicine_id === med.medicine_id)
      );

    // Add given medicines to `medicines_given`
    patientHistory.visits[visitIndex].medicines_given.push(...medicinesGiven);

    // Save the updated document
    await patientHistory.save();

    return res.status(200).json({ message: 'Medicine pickup recorded successfully!' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
