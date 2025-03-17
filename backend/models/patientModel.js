const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    book_no: { type: String, required: true, unique: true },
    patient_name: { type: String, required: true },
    patient_age: { type: Number, required: true },
    patient_sex: { type: String, required: true },
    patient_phone_no: { type: String, required: true },
    patient_area: { type: String, required: true },
  });
  
const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;