# 🚀 FreelanceFlow – Freelancer Management SaaS

FreelanceFlow is a full-stack MERN application that helps freelancers manage clients, projects, tasks, invoices, and time tracking from a single dashboard.

---

# 🌐 Live Demo

### Frontend (Vercel)

https://freelanceflow-nine-omega.vercel.app

### Backend API (Render)

https://freelance-1-53cj.onrender.com

---

# 📂 GitHub Repository

https://github.com/afshafathima/Freelance

---

# ✨ Features

## Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes

## Client Management
- Add Clients
- Edit Clients
- Delete Clients
- View Client Details

## Project Management
- Create Projects
- Update Project Status
- Assign Clients
- Project Dashboard

## Task Management
- Add Tasks
- Update Task Status
- Delete Tasks
- Due Date Tracking

## Time Tracking
- Start Timer
- Stop Timer
- Store Time Logs
- Total Hours Calculation

## Invoice Management
- Generate Invoices
- Download PDF Invoice
- Track Invoice Status

## Dashboard
- Active Projects
- Total Clients
- Pending Invoices
- Recent Activity
- Financial Summary

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- React Router
- Axios
- Lucide React
- jsPDF
- React PDF

## Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- CORS

## Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

# 📁 Project Structure

```
FreelanceFlow
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/afshafathima/Freelance.git

cd Freelance
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Run backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend

```bash
npm run dev
```

---

# API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
PUT  /api/auth/upgrade
```

## Clients

```
GET
POST
PUT
DELETE
/api/clients
```

## Projects

```
GET
POST
PUT
DELETE
/api/projects
```

## Tasks

```
GET
POST
PUT
DELETE
/api/tasks
```

## Timer

```
POST /api/timer/start
POST /api/timer/stop
GET  /api/timer
```

## Invoices

```
GET
POST
PUT
DELETE
/api/invoices
```

---

# 📄 Invoice Template

The application generates professional PDF invoices using **jsPDF**.

Each invoice contains:

- Company Name
- Freelancer Details
- Client Details
- Invoice Number
- Issue Date
- Due Date
- Services
- Total Amount
- Payment Status

---

# 📊 Sample Data

To make evaluation easier, the application provides sample data through the Seed API.

Endpoint

```
POST /api/seed
```

This automatically creates:

- Sample Clients
- Sample Projects
- Sample Tasks
- Sample Invoices

No manual data entry is required before testing dashboards and charts.

---

# ⏱ Timer Logic

The timer is designed to persist even if the page is refreshed.

Implementation:

- When the timer starts, the start timestamp is saved.
- The timer continues calculating elapsed time using the saved start time.
- Time logs are stored in MongoDB.
- When stopped, the total duration is calculated and saved.
- The dashboard retrieves total tracked hours from the database.

This ensures timing data is not lost during browser refreshes.

---

# 🔒 Authentication

- JWT Tokens
- Protected API Routes
- Authorization Middleware
- Secure Password Hashing

---

# 🚀 Deployment

## Frontend

Vercel

https://freelanceflow-nine-omega.vercel.app

## Backend

Render

https://freelance-1-53cj.onrender.com

---

# 📷 Screenshots

Add screenshots of:

- Login
- Register
- Dashboard
- Clients
- Projects
- Tasks
- Time Tracker
- Invoices

---

# 👩‍💻 Developer

**Afsha Fathima**

GitHub

https://github.com/afshafathima

---

# 📜 License

This project is developed for educational and portfolio purposes.
