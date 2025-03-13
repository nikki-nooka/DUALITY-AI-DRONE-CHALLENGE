const mongoose = require('mongoose');

// Vitals Schema
const VitalsSchema = new mongoose.Schema({
    book_no: { type: String, required: true },
    rbs: { type: Number, required: true },
    bp: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    pulse: { type: Number, required: true },
    extra_note: { type: String },
    timestamp: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  });
  
const Vitals = mongoose.model('Vitals', VitalsSchema);

module.exports = Vitals;