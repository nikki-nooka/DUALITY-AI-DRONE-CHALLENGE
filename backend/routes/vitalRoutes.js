const express = require('express');
const router = express.Router();
const Vitals = require('../models/vitalsModel');

router.post('/', async (req, res) => {
  const { book_no, rbs, bp, height, weight, pulse, extra_note } = req.body;
    console.log ('Received data:', req.body)
  try {
    const newVitals = new Vitals({
      book_no,
      rbs: rbs || null,
      bp: bp || null,
      height: height || null,
      weight: weight || null,
      pulse: pulse || null,
      extra_note: extra_note || null,
      timestamp: new Date().toISOString().slice(0, 7)
    });
    await newVitals.save();
    return res.status(201).send({ message: 'Vitals data saved successfully' });
  } catch (error) {
    return res.status(400).send(error);
  }
});

module.exports = router;