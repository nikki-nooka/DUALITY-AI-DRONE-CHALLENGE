const express = require('express');
const router = express.Router();
const PatientHistory = require('../models/patientHistoryModel');
const Inventory = require('../models/inventoryModel');

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
        visit.medicines_prescribed.push(...prescriptions);
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

    const unpickedMedicines = visit.medicines_prescribed.filter(
      (med) => !visit.medicines_given.some((given) => given.medicine_id === med.medicine_id)
    );

    return res.status(200).json({ medicines_prescribed: unpickedMedicines });
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
    let visit = patientHistory.visits.find(visit => visit.timestamp === currentMonthYear);

    if (!visit) {
      return res.status(404).json({ message: 'No prescription found for this month.' });
    }

    const inventoryItems = await Inventory.find({
      medicine_id: { $in: medicinesGiven.map(med => med.medicine_id) }
    });

    let insufficientStock = [];

    for (let med of medicinesGiven) {
      const inventoryItem = inventoryItems.find(item => item.medicine_id === med.medicine_id);

      if (!inventoryItem || inventoryItem.total_quantity < med.quantity) {
        insufficientStock.push(med.medicine_id);
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: 'Not enough stock for the following medicines',
        insufficientStock
      });
    }

    for (let med of medicinesGiven) {
      await Inventory.findOneAndUpdate(
        { medicine_id: med.medicine_id },
        { $inc: { total_quantity: -med.quantity } }
      );
    }

    visit.medicines_given.push(...medicinesGiven);

    await patientHistory.save();

    return res.status(200).json({ message: 'Medicine pickup confirmed, inventory updated, and patient history preserved!' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/medicine-verification/:book_no', async (req, res) => {
  try {
    const { book_no } = req.params;
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    const patientHistory = await PatientHistory.findOne({ book_no });

    if (!patientHistory) {
      return res.status(404).json({ message: 'No patient history found.' });
    }

    let visit = patientHistory.visits.find(visit => visit.timestamp === currentMonthYear);
    if (!visit) {
      return res.status(404).json({ message: 'No records found for this month.' });
    }

    return res.status(200).json({
      medicines_prescribed: visit.medicines_prescribed,
      medicines_given: visit.medicines_given
    });
  } catch (error) {
    console.error('Error fetching verification data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
