const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const Queue = require('../models/queueModel');

// POST /api/queue/add
router.post('/add', async (req, res) => {
  const { book_no, doctor_names } = req.body;

  if (!book_no || !Array.isArray(doctor_names) || doctor_names.length === 0) {
    return res.status(400).json({ message: 'book_no and doctor_names are required' });
  }

  try {
    // Find all doctors matching the given names
    const doctors = await Doctor.find({ doctor_name: { $in: doctor_names } });

    if (doctors.length !== doctor_names.length) {
      const foundNames = doctors.map(d => d.doctor_name);
      const missingNames = doctor_names.filter(name => !foundNames.includes(name));
      return res.status(404).json({ message: `Doctor(s) not found: ${missingNames.join(', ')}` });
    }

    // Build doctor_list with IDs and names
    const doctor_list = doctors.map(doc => ({
      doctor_id: doc.doctor_id,
      doctor_name: doc.doctor_name
    }));

    // Get the current highest queue number
    const lastQueue = await Queue.findOne().sort({ queue_no: -1 });
    const nextQueueNo = lastQueue ? lastQueue.queue_no + 1 : 1;

    // Create and save new queue entry
    const newQueueEntry = new Queue({
      queue_no: nextQueueNo,
      book_no,
      doctor_list
    });

    await newQueueEntry.save();

    res.status(201).json({
      message: 'Queue entry created successfully',
      queue_no: nextQueueNo,
      book_no,
      doctor_list
    });

  } catch (error) {
    console.error('Error creating queue entry:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
