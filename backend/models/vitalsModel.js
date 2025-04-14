const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
    book_no: { type: String, required: true },
    rbs: { type: Number },
    bp: { type: String },
    height: { type: Number },
    weight: { type: Number },
    pulse: { type: Number },
    extra_note: { type: String },
    timestamp: { type: Date  , required: true},
  });
  
const Vitals = mongoose.model('Vitals', VitalsSchema);

module.exports = Vitals;