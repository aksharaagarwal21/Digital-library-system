# 📚 LibraVault — Digital Library Management System

A scalable, full-stack **Digital Library Management System** built with modern web technologies. Features a beautiful dark-themed UI, role-based access control, complete book and member management, borrow tracking with fine calculation, and rich analytics dashboard.

---

## 🖥️ Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18, React Router v6, Zustand    |
| Styling    | Custom CSS (no framework), Chart.js   |
| Backend    | Node.js, Express.js                   |
| Database   | **MySQL** via Sequelize ORM           |
| Auth       | JWT (JSON Web Tokens) + bcrypt        |
| Dev Tools  | nodemon, concurrently                 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- **MySQL 8.0+** running locally or remotely
- npm v9+

### 1. Clone / Extract the project

### 2. Set up MySQL Database
```sql
CREATE DATABASE digital_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment
```bash
# Copy env file
cp backend/.env.example backend/.env

# Edit backend/.env with your MySQL credentials:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=digital_library
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_this_to_a_long_random_string
```

### 4. Install Dependencies
```bash
# From the project root
npm install          # installs concurrently
npm run install:all  # installs backend + frontend deps
```

### 5. Seed the Database
```bash
npm run seed
# This creates tables, categories, users (admin/librarian/members), books, and sample borrows
```

### 6. Start the Application
```bash
npm run dev   # starts both backend (port 5000) and frontend (port 3000)
```

Open **http://localhost:3000** in your browser.

---

## 🔐 Demo Credentials

| Role       | Email                      | Password       |
|------------|----------------------------|----------------|
| Admin      | admin@library.com          | admin123       |
| Librarian  | librarian@library.com      | librarian123   |
| Member     | arjun@example.com          | member123      |

---

## ✨ Features

### 👑 Admin / Librarian
- **Dashboard** — Stats cards, monthly borrow chart, category distribution, recent activity
- **Book Catalog** — Add, edit, delete, search, filter books with full CRUD
- **Borrow Management** — Issue books to members, process returns, handle renewals
- **Member Management** — Register, view, edit members with full detail view
- **Categories** — Create and manage book categories with icons and colors
- **Fine Calculation** — Automatic ₹5/day fine for overdue books

### 📖 Member
- **Browse Books** — Search and filter the entire catalog
- **My Books** — View active borrows, overdue status, renew books
- **Profile Settings** — Update personal info, change password

### 🔒 Security
- JWT authentication with 7-day expiry
- Role-based access control (admin / librarian / member)
- Password hashing with bcrypt (12 rounds)
- Rate limiting (500 req/15min)
- Helmet.js security headers

---

## 🗄️ Database Schema (MySQL)

```
users          — id, name, email, password, role, membershipId, membershipType, borrowLimit ...
categories     — id, name, description, icon, color, slug, bookCount ...
books          — id, title, author, isbn, categoryId, publisher, pages, totalCopies, availableCopies ...
borrows        — id, bookId, memberId, issuedBy, borrowDate, dueDate, returnDate, status, fine ...
```

---

## 📁 Project Structure

```
digital-library/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection (Sequelize + MySQL)
│   │   ├── controllers/    # Business logic (auth, books, borrows, members, dashboard)
│   │   ├── middleware/     # Auth, error handler
│   │   ├── models/         # Sequelize models + associations
│   │   ├── routes/         # Express route definitions
│   │   ├── utils/          # Seeder script
│   │   └── server.js       # App entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/             # HTML template, fonts
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/     # Sidebar, Topbar
│   │   ├── pages/          # All page components
│   │   ├── services/       # Axios API client
│   │   ├── store/          # Zustand auth store
│   │   ├── styles/         # Global CSS
│   │   ├── App.jsx         # Routes + layout
│   │   └── index.js
│   └── package.json
│
├── package.json            # Root scripts
└── README.md
```

---

## 🌐 API Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password

GET    /api/books            (search, filter, paginate)
POST   /api/books            (admin/librarian)
PUT    /api/books/:id
DELETE /api/books/:id

GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id

GET    /api/members
GET    /api/members/:id
PUT    /api/members/:id

GET    /api/borrows
GET    /api/borrows/my       (member: own borrows)
POST   /api/borrows/borrow
POST   /api/borrows/return
PUT    /api/borrows/:id/renew

GET    /api/dashboard/stats
```

---

## 🎨 Design

- **Dark theme** with deep navy palette
- **Playfair Display** (serif) for headings
- **DM Sans** for body text
- **JetBrains Mono** for codes/IDs
- Smooth animations and micro-interactions
- Fully responsive layout

---

## 📝 License
MIT — Free for educational and personal use.
