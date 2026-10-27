# Eventify — Premier Event Management & Digital Ticketing Platform

**Eventify** is a modern, responsive, full-stack web application designed for organizing, discovering, and booking events with real-time digital ticket generation, cryptographic QR code scanning, and live attendance analytics.

---

## 🌟 Key Features

### 1. User Authentication & Role-Based Access Control
- **JWT-Based Authentication** with bcrypt password hashing.
- 3 distinct user roles:
  - **Attendee:** Discover events, register for free or paid events, view digital tickets, cancel bookings.
  - **Organizer:** Create, edit, and delete events; view the real-time analytics dashboard; scan & verify tickets at the gate.
  - **Administrator:** Full platform oversight, user role management, account suspension/activation, and event moderation.
- Instant 1-click demo login buttons for all roles on the login page.

### 2. Event Discovery & Management
- Search events by keywords, title, or venue.
- Filter by category (*Technology, Music & Concerts, Workshops & Education, Business & Networking, Sports & Fitness, Food & Drink*).
- Filter by format (*In-Person, Online / Virtual*) and price (*Free, Paid*).
- Real-time remaining capacity tracker preventing overbooking.
- Create & edit events with custom banner image presets and automatic tag generation.

### 3. Digital Ticketing & Booking
- Support for free registrations and paid ticket booking (with explicit demo payment sandbox labeling).
- Unique human-readable booking IDs (e.g. `EVT-2026-XXXXXX`).
- Duplicate registration prevention per event per attendee email.
- Booking status management and attendee-initiated cancellation with automatic capacity restoration.

### 4. Atomic QR Code Ticket Verification
- Cryptographically verifiable unique ticket codes (e.g. `TKT-AI26-9A8B7C`).
- Printable and downloadable digital boarding-pass tickets with high-resolution QR matrix.
- **Gate Entrance Scanner:**
  - Live optical camera QR code scanner.
  - Manual code input for rapid entry.
  - Quick 1-click simulation test cases (*Valid Ticket*, *Already Used Ticket*, *Invalid Ticket*).
  - Audio chimes and visual alerts:
    - 🟢 **VALID TICKET:** Check-in recorded atomically with timestamp and scanner staff name.
    - 🟡 **ALREADY CHECKED IN:** Duplicate check-in blocked with prior timestamp.
    - 🔴 **INVALID TICKET / FORGED:** Code rejected.
  - Real-time audit log of gate scans.

### 5. Dashboards & Analytics
- **Organizer Dashboard:** Total events, registrations, revenue, checked-in count, and attendance percentage.
- **Interactive Recharts Visualizations:**
  - Event registrations vs. capacity bar chart.
  - Category distribution pie chart.
  - Registration trends over time area chart.
  - Check-in status ratio chart.
- **Admin Panel:** Platform GMV, total user directory, ban/reactivate accounts, promote/demote roles, and event moderation.

---

## 📁 Project Structure

```
c:\eventify\
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & status reporting
│   ├── controllers/
│   │   ├── adminController.js     # Platform administration & user moderation
│   │   ├── authController.js      # JWT register, login, profile updates
│   │   ├── bookingController.js   # Booking transactions & duplicate protection
│   │   ├── dashboardController.js # Organizer statistics & Recharts data aggregation
│   │   ├── eventController.js     # Event CRUD & category counters
│   │   └── ticketController.js    # QR generation, atomic check-in validation
│   ├── data/
│   │   ├── seedData.js            # Initial realistic seed users, events, and tickets
│   │   └── db.json                # Persisted embedded database
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role authorization guards
│   │   └── errorHandler.js        # Global error handling
│   ├── models/
│   │   ├── Booking.js             # Mongoose Booking schema
│   │   ├── CheckIn.js             # Mongoose CheckIn audit schema
│   │   ├── Event.js               # Mongoose Event schema
│   │   ├── Ticket.js              # Mongoose Ticket schema
│   │   └── User.js                # Mongoose User schema
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── eventRoutes.js
│   │   └── ticketRoutes.js
│   ├── store/
│   │   └── dbStore.js             # Resilient hybrid store (MongoDB Atlas / Embedded fallback)
│   ├── .env                       # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express API server & static SPA host
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingModal.jsx   # Ticket quantity selector & demo checkout
│   │   │   ├── EventCard.jsx      # Event listing card with capacity bar
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx         # Responsive navigation & role badge dropdown
│   │   │   ├── ProtectedRoute.jsx # Role-based route guard
│   │   │   ├── StatsCard.jsx      # KPI metric card with icons & deltas
│   │   │   └── Toast.jsx          # Sliding notifications
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # User session, JWT persistence, roles
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── CreateEventPage.jsx
│   │   │   ├── DigitalTicketPage.jsx
│   │   │   ├── EditEventPage.jsx
│   │   │   ├── EventDetailsPage.jsx
│   │   │   ├── ExploreEventsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyBookingsPage.jsx
│   │   │   ├── OrganizerDashboardPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── QrVerificationPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js             # REST API client with Bearer auth
│   │   ├── App.jsx                # Router & page declarations
│   │   ├── index.css              # Tailwind CSS directives & animations
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── test-e2e.js                    # 12-suite end-to-end integration test runner
├── package.json                   # Root orchestrator scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+)
- *(Optional)* **MongoDB** (local mongod or MongoDB Atlas connection string)

### 2. Environment Setup
The backend `.env` file is pre-configured in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventify
JWT_SECRET=eventify_super_secret_jwt_key_2026_secured
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```
> **Zero-Friction Database:** If a local MongoDB daemon is not detected on port 27017, the application automatically switches to its high-performance built-in persistent storage engine seeded with realistic sample events, users, and digital tickets. To connect to MongoDB Atlas, simply provide your `MONGODB_URI`.

### 3. Installation
Install all dependencies for root, backend, and frontend:
```bash
npm install --prefix backend
npm install --prefix frontend
```

### 4. Running the Application
To run the full-stack server (serving both the REST API and the React frontend on port 5000):
```bash
node backend/server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

For hot-reloading frontend development:
```bash
# Terminal 1 (Backend API)
npm run dev --prefix backend

# Terminal 2 (Vite Hot-Reloading Frontend)
npm run dev --prefix frontend
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Pre-Seeded Demo Accounts

You can click the 1-click quick login buttons on the **[Login Page](http://localhost:5000/login)** or use these credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Attendee** | `attendee@eventify.com` | `attendee123` | Browse events, book tickets, view digital passes |
| **Organizer** | `organizer@eventify.com` | `organizer123` | Create/edit events, view dashboard, scan gate QR codes |
| **Administrator** | `admin@eventify.com` | `admin123` | Full platform analytics, user moderation, all events |

---

## 🧪 Testing Verification
Run the automated end-to-end verification suite:
```bash
node test-e2e.js
```
This tests all 12 core user flows:
1. Health check endpoint
2. Static frontend SPA serving
3. Events & categories discovery
4. Multi-role authentication (Attendee, Organizer, Admin)
5. Organizer event creation
6. Ticket booking & cryptographic QR generation
7. Duplicate registration prevention
8. Atomic gate check-in verification
9. Already-used ticket duplicate prevention
10. Forged / invalid ticket rejection
11. Recharts metrics & analytics generation
12. Platform administrator stats

---

## 📄 License
MIT © 2026 Eventify Inc.

