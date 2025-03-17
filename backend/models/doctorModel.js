const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    doctor_id: { type: Number, required: true, unique: true },
    doctor_name: { type: String, required: true },
    doctor_age: { type: Number, required: true },
    doctor_sex: { type: String, required: true },
    specialization: { type: String, required: true },
    doctor_email: { type: String, required: true, unique: true },
    doctor_phone_no: { type: String, required: true },
    doctor_availability: { type: Boolean, required: true },
  });
  
const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;