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

    const visit = patientHistory.visits.find(visit => visit.timestamp === currentMonthYear);

    if (!visit || !Array.isArray(visit.medicines_prescribed) || visit.medicines_prescribed.length === 0) {
      return res.status(404).json({ message: 'No valid prescription data for this month.' });
    }

    const prescribedMedicineIds = visit.medicines_prescribed.map(med => med.medicine_id);

    const inventoryItems = await Inventory.find({
      medicine_id: { $in: prescribedMedicineIds }
    });

    const unpickedMedicines = visit.medicines_prescribed
      .filter(med => {
        return !visit.medicines_given.some(given => given.medicine_id === med.medicine_id);
      })
      .map(med => {
        const inventoryItem = inventoryItems.find(item => item.medicine_id === med.medicine_id);

        const batches = (inventoryItem?.medicine_details || []).map(batch => ({
          medicine_name: batch.medicine_name,
          expiry_date: batch.expiry_date,
          available_quantity: batch.quantity,
          quantity_taken: 0 // Placeholder for frontend input
        }));

        return {
          medicine_id: med.medicine_id,
          quantity: med.quantity,
          medicine_formulation: inventoryItem?.medicine_formulation || 'N/A',
          batches
        };
      });

    return res.status(200).json({ medicines_prescribed: unpickedMedicines });
  } catch (error) {
    console.error('Error fetching medicine pickup info:', error);
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

    // Create a list of medicine IDs to fetch from inventory
    const medicineIds = [...new Set(medicinesGiven.map(med => med.medicine_id))];
    
    // Fetch all inventory items for these medicines
    const inventoryItems = await Inventory.find({
      medicine_id: { $in: medicineIds }
    });

    let insufficientStock = [];

    // Check stock availability for each medicine
    for (let med of medicinesGiven) {
      const inventoryItem = inventoryItems.find(item => item.medicine_id === med.medicine_id);
      
      if (!inventoryItem) {
        insufficientStock.push(`${med.medicine_name} (ID: ${med.medicine_id})`);
        continue;
      }

      // Find the specific batch by comparing expiry date and name
      const batchDetail = inventoryItem.medicine_details.find(
        detail => 
          detail.medicine_name === med.medicine_name && 
          new Date(detail.expiry_date).toISOString() === new Date(med.expiry_date).toISOString()
      );

      if (!batchDetail) {
        insufficientStock.push(`${med.medicine_name} (Batch not found)`);
        continue;
      }

      if (batchDetail.quantity < med.quantity) {
        insufficientStock.push(`${med.medicine_name} (Available: ${batchDetail.quantity}, Requested: ${med.quantity})`);
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: 'Not enough stock for the following medicines',
        insufficientStock
      });
    }

    // Update inventory
    for (let med of medicinesGiven) {
      const inventoryItem = inventoryItems.find(item => item.medicine_id === med.medicine_id);
      
      // Find the specific batch
      const batchDetail = inventoryItem.medicine_details.find(
        detail => 
          detail.medicine_name === med.medicine_name && 
          new Date(detail.expiry_date).toISOString() === new Date(med.expiry_date).toISOString()
      );

      // Update batch quantity
      batchDetail.quantity -= med.quantity;
      
      // Update total quantity for the medicine
      inventoryItem.total_quantity -= med.quantity;
      
      await inventoryItem.save();
    }

    // Update patient history with given medicines
    const formattedMedicinesGiven = medicinesGiven.map(med => ({
      medicine_id: med.medicine_id,
      quantity: med.quantity
    }));

    visit.medicines_given.push(...formattedMedicinesGiven);
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
