# Adopt-a-Barangay Web Application

A community-driven web application designed to support efficient administrative processes at the barangay level, specifically implemented for Barangay Bunawan, Iligan City. This system promotes inclusive service delivery, digital governance, and sustainable development aligned with the Sustainable Development Goals (SDGs).

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [System Roles](#system-roles)
- [Future Enhancements](#future-enhancements)

---

## Project Overview
The Adopt-a-Barangay web application enables barangay officials to manage resident records, generate reports, handle document requests, and share announcements with the community. It addresses the common challenges in barangay administration such as inefficient data handling, lack of centralized systems, and limited communication tools.

This system contributes to:
- **SDG 10:** Reduced Inequalities
- **SDG 11:** Sustainable Cities and Communities
- **SDG 16:** Peace, Justice, and Strong Institutions

---

## Features
- **Resident Profile Management** (Add, Edit, Delete, Import, Export)
- **Search and Filter Functionality** (By name, gender, purok, etc.)
- **Data Visualization** (Age, gender, educational level, PWD, voter status)
- **Role-Based User Access** (Admin, Barangay Captain, Staff, Resident)
- **Document Requests and Approvals** (Barangay clearance, indigency, residency)
- **PDF Document Generation**
- **Barangay Announcements and Projects Display**
- **User Account Management** (Edit profile, delete account)

---

## Technologies Used
### Frontend
- React.js
- Tailwind CSS
- Vite
- Framer Motion
- Recharts
- React Router
- Papaparse
- Html2Canvas
- PDF-lib
- Leaflet & React-Leaflet
- React Toastify

### Backend
- Node.js
- Express.js
- Redis
- bcrypt
- multer
- dotenv
- express-session
- body-parser
- cors

---

## Installation
1. **Clone the repository:**
```bash
git clone https://github.com/bethRefugio/barangay_profiling_system.git
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

3. **Backend Setup:**
```bash
cd backend
npm install
node server.js
```

---

## Usage
After deployment or local setup:
1. Users can sign up via the Signup Page.
2. Residents can request documents and view barangay announcements.
3. Staff, admin, and the barangay captain can manage residents, documents, users, and announcements.
4. Visualizations are available on the Demographics Page for insight-based decision-making.

---

## System Roles
- **Admin**: Full access to all system modules
- **Barangay Captain**: Same access as admin with a focus on community leadership
- **Staff**: Manage residents and document requests
- **Resident**: Submit document requests and access announcements
- **Guest**: Can only view the 

---

## Future Enhancements
- Mobile app integration for better accessibility
- AI-driven analytics for proactive planning
- Enhanced data security (audit logs, encryption)
- Offline data synchronization
- Integration with national registries

---


