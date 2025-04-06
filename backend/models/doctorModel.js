const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    doctor_id: { type: Number, required: true, unique: true },
    doctor_name: { type: String, required: true },
    doctor_age: { type: Number, required: false },
    doctor_sex: { type: String, required: false },
    specialization: { type: String, required: false },
    doctor_email: { type: String, required: false},
    doctor_phone_no: { type: String, required: true, unique: true },
    doctor_availability: { type: Boolean, required: true },
  });
  
const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;