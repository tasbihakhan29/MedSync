# 💊 MedSync City
### City-Level Medicine Expiry & Availability Coordination System

A production-ready full-stack web application for coordinating medicine inventory, expiry management, and transfers across multiple hospitals and pharmacies in a city.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Authentication | JWT (jjwt 0.11.5) + BCrypt |
| Database | MySQL 8.0 |
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS with CSS variables |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
medsync/
├── backend/                          # Spring Boot application
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/medsync/
│       │   ├── MedSyncApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── DataInitializer.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── AdminController.java
│       │   │   └── HospitalController.java
│       │   ├── dto/
│       │   │   ├── AuthDto.java
│       │   │   ├── MedicineDto.java
│       │   │   └── RequestDto.java
│       │   ├── entity/
│       │   │   ├── User.java
│       │   │   ├── Hospital.java
│       │   │   ├── Medicine.java
│       │   │   ├── MedicineBatch.java
│       │   │   ├── MedicineRequest.java
│       │   │   └── AuditLog.java
│       │   ├── repository/  (6 repositories)
│       │   ├── security/
│       │   │   ├── JwtUtils.java
│       │   │   └── JwtAuthenticationFilter.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── AdminService.java
│       │       ├── MedicineService.java
│       │       ├── RequestService.java
│       │       ├── AuditService.java
│       │       └── UserDetailsServiceImpl.java
│       └── resources/
│           ├── application.properties
│           └── schema.sql              ← Run this first!
│
└── frontend/                          # React application
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/AuthContext.js
        ├── services/api.js
        ├── components/shared/Layout.js
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── admin/
            │   ├── AdminDashboard.js
            │   ├── AdminRegistrations.js
            │   ├── AdminMedicines.js
            │   ├── AdminInstitutions.js
            │   └── AdminAuditLogs.js
            └── hospital/
                ├── HospitalDashboard.js
                ├── HospitalInventory.js
                ├── HospitalExpiry.js
                ├── HospitalRequests.js
                └── MedicineSearch.js
```

---

## ⚡ Quick Start

### Step 1 — Database Setup
```sql
-- Open MySQL and run:
mysql -u root -p < backend/src/main/resources/schema.sql
```

### Step 2 — Configure Backend
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medsync_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3 — Run Backend
```bash
cd backend
mvn spring-boot:run
# Backend starts at http://localhost:8080
```

### Step 4 — Run Frontend
```bash
cd frontend
npm install
npm start
# Frontend starts at http://localhost:3000
```

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| City Admin | `admin` | `Admin@123` |

The admin is auto-created on first startup. Register hospitals/pharmacies via the registration page.

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/register` | Register new hospital/pharmacy |

### City Admin (requires `CITY_ADMIN` role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | System stats |
| GET | `/api/admin/registrations/pending` | Pending approvals |
| POST | `/api/admin/registrations/{id}/approve?approve=true` | Approve/reject registration |
| GET | `/api/admin/medicines/pending` | Medicines awaiting approval |
| POST | `/api/admin/medicines/{id}/approve?approve=true` | Approve/reject medicine |
| GET | `/api/admin/institutions` | All institutions |
| GET | `/api/admin/audit-logs` | Recent audit trail |
| GET | `/api/admin/requests` | All transfer requests |

### Hospital/Pharmacy (requires `HOSPITAL` or `PHARMACY` role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospital/inventory` | My medicine batches |
| POST | `/api/hospital/inventory/batch` | Add new batch |
| PUT | `/api/hospital/inventory/batch/{id}` | Update batch |
| GET | `/api/hospital/expiry/near` | Near-expiry medicines |
| GET | `/api/hospital/expiry/shared-alerts` | City-wide alerts |
| PATCH | `/api/hospital/settings/share-expiry?share=true` | Toggle expiry sharing |
| GET | `/api/hospital/medicines/search?query=...` | Search medicines |
| GET | `/api/hospital/medicines/barcode/{barcode}` | Barcode lookup |
| GET | `/api/hospital/medicines/all` | All approved medicines |
| POST | `/api/hospital/medicines` | Add medicine (pending approval) |
| GET | `/api/hospital/medicines/{id}/availability` | City-wide availability |
| POST | `/api/hospital/requests` | Create transfer request |
| GET | `/api/hospital/requests` | My requests |
| GET | `/api/hospital/requests/incoming` | Incoming requests |
| POST | `/api/hospital/requests/{id}/respond` | Accept/reject request |
| POST | `/api/hospital/requests/{id}/complete` | Mark transfer complete |

---

## 🔒 Security Features

- **JWT Authentication** — All API routes protected with Bearer tokens
- **BCrypt Password Hashing** — Industry-standard password storage
- **Role-Based Access Control** — `CITY_ADMIN`, `HOSPITAL`, `PHARMACY`
- **Account Status Flow** — PENDING → ACTIVE (requires admin approval)
- **Audit Logging** — Every important action is logged
- **Identity Anonymization** — Hospital identity hidden until request accepted
- **Input Validation** — Jakarta Validation on all DTOs
- **CORS Configuration** — Restricted to frontend origin

---

## 🎯 Key Features

### For City Admin
- ✅ Approve/reject hospital and pharmacy registrations
- ✅ Manage medicine master database
- ✅ Full audit trail visibility
- ✅ System-wide dashboard stats

### For Hospitals & Pharmacies
- ✅ Batch-level inventory tracking with expiry monitoring
- ✅ Near-expiry and critical-expiry dashboards
- ✅ City-wide medicine availability search
- ✅ Barcode lookup support
- ✅ Anonymous medicine transfer requests with tracking codes
- ✅ FIFO-based stock deduction on transfer acceptance
- ✅ Location-based supplier sorting (by distance)
- ✅ Opt-in expiry alert sharing with city network

---

## 🗄 Database Schema

6 core tables:
- `users` — Authentication and roles
- `hospitals` — Hospital/pharmacy profiles
- `medicines` — Master medicine catalog
- `medicine_batches` — Per-institution batch inventory
- `medicine_requests` — Transfer requests with tracking
- `audit_logs` — Complete action audit trail

---

## 🚀 Extending the Project

- **AI Demand Prediction** — Integrate Google Gemini API in a new `PredictionService`
- **Real-time Notifications** — Add WebSocket (Spring WebSocket + SockJS)
- **Barcode Scanning** — Integrate `react-zxing` for camera-based scanning
- **Maps Integration** — Add Leaflet.js for visual hospital location display
- **Mobile App** — The REST API is ready for React Native or Flutter

---

*Built for MedSync City — Improving healthcare supply chain coordination.*
