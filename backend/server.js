require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

require('./models/userModel');
require('./models/patientModel');
require('./models/medicineCategoryModel');
require('./models/inventoryModel');
require('./models/patientHistoryModel');
require('./models/vitalsModel');
require('./models/doctorModel');

const patientRoutes = require('./routes/patientRoutes');
const vitalRoutes = require('./routes/vitalRoutes');
const patientHistoryRoutes = require('./routes/patientHistoryRoutes');
const doctorAssignRoutes = require('./routes/doctorAssignRoutes');
const adminSideGeneralRoutes = require('./routes/adminSideGeneralRoutes');
const adminSideMedicineRoutes = require('./routes/adminSideMedicineRoutes');
const adminSideDoctorRoutes = require('./routes/adminSideDoctorRoutes');


const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/patient-history', patientHistoryRoutes);
app.use('/api/doctor-assign', doctorAssignRoutes);
app.use('/api/admin', adminSideGeneralRoutes);
app.use('/api/admin', adminSideMedicineRoutes);
app.use('/api/admin', adminSideDoctorRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
