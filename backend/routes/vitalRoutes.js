const express = require('express');
const router = express.Router();
const Vitals = require('../models/vitalsModel');

router.post('/', async (req, res) => {
  const { book_no, rbs, bp, height, weight, pulse, extra_note } = req.body;
  console.log('Received data:', req.body);

  const currentMonthYear = new Date().toISOString().slice(0, 7);

  try {
    let existingVitals = await Vitals.findOne({ book_no, timestamp: currentMonthYear });

    if (existingVitals) {
      existingVitals.rbs = rbs || existingVitals.rbs;
      existingVitals.bp = bp || existingVitals.bp;
      existingVitals.height = height || existingVitals.height;
      existingVitals.weight = weight || existingVitals.weight;
      existingVitals.pulse = pulse || existingVitals.pulse;
      existingVitals.extra_note = extra_note || existingVitals.extra_note;

      await existingVitals.save();
      return res.status(200).send({ message: 'Vitals data updated successfully' });
    } else {
      const newVitals = new Vitals({
        book_no,
        rbs: rbs || null,
        bp: bp || null,
        height: height || null,
        weight: weight || null,
        pulse: pulse || null,
        extra_note: extra_note || null,
        timestamp: currentMonthYear
      });

      await newVitals.save();
      return res.status(201).send({ message: 'Vitals data saved successfully' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(400).send({ message: error.message });
  }
});

module.exports = router;