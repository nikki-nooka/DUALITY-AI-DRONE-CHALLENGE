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

// Middleware
const loggingMiddleware = require('./middleware/loggingMiddleware');

const patientRoutes = require('./routes/patientRoutes');
const vitalRoutes = require('./routes/vitalRoutes');
const patientHistoryRoutes = require('./routes/patientHistoryRoutes');
const doctorAssignRoutes = require('./routes/doctorAssignRoutes');
const adminSideGeneralRoutes = require('./routes/adminSideGeneralRoutes');
const adminSideMedicineRoutes = require('./routes/adminSideMedicineRoutes');
const adminSideDoctorRoutes = require('./routes/adminSideDoctorRoutes');
const adminSideVolunteerRoutes = require('./routes/adminSideVolunteerRoutes'); // Add this line

const app = express();
app.use(express.json());
app.use(cors());
app.use(loggingMiddleware); // Apply logging middleware to all routes, to log all actions

connectDB();

app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/patient-history', patientHistoryRoutes);
app.use('/api/doctor-assign', doctorAssignRoutes);
app.use('/api/admin', adminSideGeneralRoutes);
app.use('/api/admin', adminSideMedicineRoutes);
app.use('/api/admin', adminSideDoctorRoutes);
app.use('/api/admin', adminSideVolunteerRoutes); // Add this line

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
