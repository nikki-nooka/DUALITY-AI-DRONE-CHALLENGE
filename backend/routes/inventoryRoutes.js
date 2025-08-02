const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventoryModel');

router.get('/formulation/:formulation', async (req, res) => {
  try {
    const { formulation } = req.params;
    // Partial, case-insensitive search
    const inventory = await Inventory.find({
      medicine_formulation: { $regex: formulation, $options: 'i' }
    });
    if (!inventory || inventory.length === 0) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    // If you want to return all matches:
    res.json(inventory.map(item => ({
      medicine_formulation: item.medicine_formulation,
      details: item.medicine_details.map(({ medicine_name, expiry_date, quantity }) => ({
        medicine_name,
        expiry_date,
        quantity
      }))
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.get('/:medicineId', async (req, res) => {
  try {
    const { medicineId } = req.params;
    const inventory = await Inventory.findOne({ medicine_id: medicineId });
    if (!inventory) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({
      medicine_formulation: inventory.medicine_formulation,
      details: inventory.medicine_details.map(({ medicine_name, expiry_date, quantity }) => ({
        medicine_name,
        expiry_date,
        quantity
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
