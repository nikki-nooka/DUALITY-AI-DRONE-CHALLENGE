# Dass Team 24 Improving Healthcare System

**A comprehensive web-based application to streamline and digitize healthcare camp management for SWECHA.**

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture & Folder Structure](#architecture--folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Usage](#usage)

   * [Running the Application](#running-the-application)
   * [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Contributing](#contributing)
9. [License](#license)
10. [Authors & Acknowledgments](#authors--acknowledgments)

---

## Overview

This project provides a digital platform for managing SWECHA’s monthly medical camps, enabling volunteers and administrators to register patients, record vitals, assign doctors, manage prescriptions, dispense medicines, and track inventory in real time. The system ensures efficient workflows, accurate record-keeping, and transparent logging.

---

## Features

* **Authentication & Authorization**: Secure JWT-based login with role-based access control for Admins and Volunteers.
* **Patient Management**: CRUD operations for patient records, unique Book ID generation, and comprehensive patient history tracking (visits, assigned doctors, prescriptions, vitals).
* **Vitals Recording**: Input and validation of vital signs including blood pressure, blood sugar, height, weight, and pulse.
* **Doctor Management**: CRUD operations for doctor profiles with availability and specialization, plus assignment of patients based on a first-come-first-served queue.
* **Prescription Handling**: Doctors can prescribe treatment plans which are stored in patient history.
* **Medicine Inventory**: Management of medicine batches with stock updates, duplicate batch prevention, expiry filtering, and real-time stock adjustment upon dispensing.
* **Medicine Dispensing**: Verification of Book IDs at distribution, linkage of dispensed medicines to patient records, and automatic inventory decrement.
* **Activity Logging**: Audit trail of all user actions such as record updates, vitals entries, and inventory changes.
* **Volunteer & Admin Dashboards**: Role-specific interfaces for streamlined navigation and operation.
* **Analytics & Reports**: Basic camp metrics including patient demographics, attendance, and medicines usage.
* **Concurrency Control**: Handling simultaneous inventory updates to prevent data conflicts.

---

## Tech Stack

| Layer          | Technology                                  |
| -------------- | ------------------------------------------- |
| Frontend       | React.js, React Router, Axios, Recharts     |
| Backend        | Node.js, Express.js, Mongoose (MongoDB ODM) |
| Database       | MongoDB                                     |
| Authentication | JWT, Bcrypt                                 |
| Dev Tools      | GitLab, Postman, VS Code                    |
| Optional       | Docker                                      |

---

## Architecture & Folder Structure

```plaintext
root/
├── backend/
│   ├── controllers/      # Business logic handlers
│   ├── middlewares/      # Authentication & validation
│   ├── models/           # Mongoose schemas (patientModel.js, doctorModel.js, inventoryModel.js, vitalModel.js, logModel.js)
│   ├── routes/           # Express routes (authRoutes.js, patientRoutes.js, doctorRoutes.js, medicineRoutes.js, vitalRoutes.js, logRoutes.js)
│   ├── server.js         # Entry point
│   └── .env              # Environment variables (PORT, MONGO_URI, JWT_SECRET)

├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── api/          # Axios instance and API helper functions
│   │   ├── Components/   # Reusable UI components (Navbar, Footer, forms)
│   │   ├── Pages/        # Page components (Dashboard, PatientProfile, UpdateMedicineStock)
│   │   └── Styles/       # CSS/SASS files
│   ├── .env              # REACT_APP_BACKEND URL
│   └── package.json      # Frontend dependencies and scripts

├── SRS.pdf               # Software Requirements Specification (use cases and requirements)
├── LICENSE               # MIT License
└── README.md             # Project documentation
```

---

## Installation & Setup

### Prerequisites

* Node.js v16 or higher
* MongoDB (local or cloud instance)
* npm or yarn

### Steps

1. **Clone the repository**

   ```bash
   git clone https://code.swecha.org/ananth_y/dass-team-24-improving-healthcare-system.git
   cd dass-team-24-improving-healthcare-system
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MONGO_URI and JWT_SECRET
   npm start
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Set REACT_APP_BACKEND=http://localhost:5002
   npm start
   ```

4. **Access the Application**

   * Frontend: [http://localhost:3000](http://localhost:3000)
   * Backend API: [http://localhost:5002/api](http://localhost:5002/api)

---

## Usage

### Running the Application

* Ensure both backend and frontend servers are running.
* Log in as an Admin (seeded or via API) to manage doctors, volunteers, and patients.
* Volunteers can record patient vitals and assist in dispensing medicines.

### API Endpoints

#### Authentication

* **POST** `/api/auth/login` – Login for users (Admin & Volunteer)

#### Patients

* **GET** `/api/admin/get_patient/:id` – Fetch patient details by ID
* **GET** `/api/admin/get_patients` – Fetch all patients
* **POST** `/api/admin/add_patient` – Add a new patient
* **POST** `/api/admin/edit_patient/:id` – Edit patient details
* **POST** `/api/admin/delete_patient/:id` – Delete a patient
* **GET** `/api/admin/patient_analytics/:id` – Get analytics for a specific patient

#### Doctors

* **POST** `/api/admin/add_doctor` – Add a new doctor
* **GET** `/api/admin/get_doctors` – Fetch all doctors
* **GET** `/api/admin/doctor_analytics/:id` – Get analytics for a specific doctor
* **PUT** `/api/admin/edit_doctor/:id` – Edit doctor details
* **DELETE** `/api/admin/delete_doctor/:id` – Delete a doctor
* **PUT** `/api/admin/update_doctor_availability/:id` – Update doctor availability

#### Volunteers

* **POST** `/api/admin/add_volunteer` – Add a new volunteer
* **GET** `/api/admin/get_volunteers` – Fetch all volunteers
* **GET** `/api/admin/get_volunteer/:id` – Fetch details of a specific volunteer
* **POST** `/api/admin/edit_volunteer/:id` – Edit volunteer details
* **POST** `/api/admin/delete_volunteer/:id` – Delete a specific volunteer
* **POST** `/api/admin/delete_volunteers` – Delete multiple volunteers
* **GET** `/api/admin/volunteer_analytics/:id` – Get analytics for a specific volunteer

#### Vitals

* **POST** `/api/vitals` – Record or update vitals for a patient

#### Medicines

* **POST** `/api/admin/add_new_medicine` – Add a new medicine formulation
* **POST** `/api/admin/add_new_medicine_details` – Add a new batch to an existing medicine
* **GET** `/api/admin/get_medicines` – Fetch all medicines
* **GET** `/api/admin/get_medicine/:id` – Fetch details of a specific medicine
* **POST** `/api/admin/update_medicine_stock` – Update stock for a specific batch
* **POST** `/api/admin/update_medicine_expiry_date` – Update expiry date for a specific batch
* **POST** `/api/admin/delete_medicine_batch` – Delete a specific batch of a medicine
* **POST** `/api/admin/delete_medicine` – Delete a medicine formulation

#### Patient History

* **GET** `/api/patient-history/medicine-pickup/:book_no` – Fetch unpicked medicines for a patient
* **POST** `/api/patient-history/medicine-pickup` – Confirm medicine pickup and update inventory
* **POST** `/api/patient-history/doctor-prescription` – Add prescriptions for a patient
* **GET** `/api/patient-history/medicine-verification/:book_no` – Verify medicines for a patient

#### Doctor Assignment

* **POST** `/api/doctor-assign` – Assign a doctor to a patient
* **GET** `/api/doctor-assign/get_doctors` – Fetch available doctors for assignment

#### Inventory

* **GET** `/api/inventory/:medicineId` – Fetch inventory details for a specific medicine

#### Logs

* **POST** `/api/logs` – Create a new log entry
* **GET** `/api/admin/logs` – View activity logs

#### Analytics

* **GET** `/api/admin/analytics` – Fetch overall analytics data

#### Queue

* **POST** `/api/queue/add` – Add a patient to the queue


---

## Testing

Currently, no automated tests are configured. Future enhancements could include:

* **Unit Tests**: Using Jest and Supertest for backend route testing.
* **End-to-End Tests**: Using Cypress for full application flows.

---

## Contributing

We welcome contributions:

1. Fork the repository
2. Create a branch: `git checkout -b feature/YourFeature`
3. Commit: `git commit -m 'Add YourFeature'`
4. Push: `git push origin feature/YourFeature`
5. Open a Pull Request

Please adhere to existing code style and include descriptive commit messages.

---

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

## Authors & Acknowledgments

**Team 24 (SWECHA Camp)**

* Sai Veekshith Kotha (2023101078)
* Ananth Yegavakota (2023101079)
* Larissa Lavanya (2023101105)
* Priyanshi Gupta (2023101068)
* Nikhil Sivakumar (2023114018)

Special thanks to all contributors and testers for their valuable feedback.
