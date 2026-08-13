# CareConnect – Doctor Discovery & Consultation Platform

**CareConnect** is a modern, enterprise-grade full-stack digital healthcare platform engineered using **Java 21**, **Spring Boot 3.x**, **Spring Security + JWT**, **Spring Data JPA**, **PostgreSQL**, **Flyway**, and **React.js**.

It provides an end-to-end healthcare ecosystem connecting patients with verified medical specialists through real-time schedule discovery, conflict-free slot booking, HD video consultation rooms, integrated chat, and digital prescription issuance.

---

## 🏛 System Architecture

```text
               +----------------------------------+
               |        React.js Frontend         |
               | (Vite + React Router v6 + Axios) |
               +----------------------------------+
                                │
                          HTTP / REST API
                                ▼
               +----------------------------------+
               |       Spring Boot REST API       |
               |     (Controller-Service-DTO)     |
               +----------------------------------+
                                │
                     Security & Auth Interceptor
                                ▼
               +----------------------------------+
               |      Spring Security + JWT       |
               |    (Role-Based Access Control)   |
               +----------------------------------+
                                │
                     Persistence Layer (ORM)
                                ▼
               +----------------------------------+
               |     Spring Data JPA / Hibernate  |
               +----------------------------------+
                                │
                                ▼
               +----------------------------------+
               |       PostgreSQL Database        |
               |   (Schema managed via Flyway)    |
               +----------------------------------+
```

---

## 🛠 Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.2
- **Security**: Spring Security 6.x + JJWT (JSON Web Tokens)
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL (managed with Flyway SQL migrations)
- **API Documentation**: SpringDoc OpenAPI 3 / Swagger UI
- **Build Tool**: Maven

### Frontend
- **Framework**: React.js 18 (bootstrapped with Vite)
- **Routing**: React Router v6
- **HTTP Client**: Axios (with automatic Bearer token interceptors)
- **State & Auth**: React Context API
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom tokens, glassmorphism, responsive grid)

### DevOps & Containerization
- **Docker**: Multi-stage Dockerfiles for Backend & Frontend
- **Docker Compose**: Single-command cluster startup (PostgreSQL + Spring Boot + React)
- **Environment Management**: `.env.example` template with clean fallback defaults

---

## 🚀 Key Features

### 🔐 1. Authentication & Security (RBAC)
- **Role-Based Access Control**: `ROLE_PATIENT`, `ROLE_DOCTOR`, `ROLE_ADMIN`.
- **JWT Authentication**: Statelss Access Token & Refresh Token authorization.
- **OTP Verification**: Email & SMS OTP verification support for passwordless authentication.
- **Google OAuth2**: Single Sign-On ID Token authentication.

### 🩺 2. Doctor Discovery & Search
- Filter doctors by Speciality (Cardiology, Dermatology, Pediatrics, etc.), City/Address, Name, or Availability status.
- Detailed doctor profiles showcasing years of experience, fees, hospital affiliations, ratings, and current working status.

### 📅 3. Conflict-Free Appointment Slot Booking
- Doctor-configurable live availability toggle (`Available` / `Not Available`).
- Database-level unique constraint (`doctor_id, appointment_date, time_slot`) ensuring double booking is mathematically impossible.
- Instant booking receipt generation with unique alphanumeric Booking ID (`CC-XXXXXX`).

### 💊 4. Digital Prescriptions & Consultation History
- Doctors write patient diagnosis, observations, and medicine dosages.
- Patients view and download digital prescription records attached to completed consultations.

### 🎥 5. Video Consultation & Chat Room
- WebRTC camera preview with mic/video toggles, screen snapshot export, and secure exit room controls.
- Persistent Floating Chat widget for doctor-patient communication.

---

## 📊 Database Schema (PostgreSQL + Flyway)

```sql
users (id, name, email, mobile_number, password, age, address, city, state, country, profile_picture_url, is_active, is_verified)
roles (id, name)
user_roles (user_id, role_id)
specialities (id, name, image_url)
doctor_profiles (id UUID, user_id, speciality_id, fees, experience_years, rating, is_available, working_on)
patient_profiles (id UUID, user_id, medical_history, blood_group)
appointments (id, booking_id, patient_id, doctor_id, appointment_date, time_slot, status, consultation_medium, payment_method, amount_paid)
prescriptions (id, appointment_id, doctor_notes, medicines)
otps (id, contact, code, is_verified, expires_at)
```

---

## 🔌 Core REST API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Username/Mobile + Password Login
- `POST /api/v1/auth/register` - Unified Registration (Patient & Doctor)
- `POST /api/v1/auth/otp/send` - Send Verification OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP & Authenticate
- `POST /api/v1/auth/google-login` - Google OAuth2 Login
- `POST /api/v1/auth/logout` - Logout & End Session

### Doctor Management
- `GET /api/v1/doctors/search` - Search & Filter Doctors
- `GET /api/v1/doctors/{doctorId}` - Fetch Doctor Profile by UUID
- `GET /api/v1/doctors/me` - Get Current Doctor's Profile (`ROLE_DOCTOR`)
- `PUT /api/v1/doctors/me` - Update Doctor Details (`ROLE_DOCTOR`)
- `PATCH /api/v1/doctors/me/availability` - Toggle Live Availability (`ROLE_DOCTOR`)
- `GET /api/v1/doctors/me/earnings` - Calculate Annual Revenue (`ROLE_DOCTOR`)

### Patient & Appointments
- `GET /api/v1/patients/me` - Get Patient Profile (`ROLE_PATIENT`)
- `PUT /api/v1/patients/me` - Update Patient Profile (`ROLE_PATIENT`)
- `POST /api/v1/appointments` - Book Appointment (`ROLE_PATIENT`)
- `GET /api/v1/appointments/patient` - Patient Appointment History (`ROLE_PATIENT`)
- `GET /api/v1/appointments/doctor` - Doctor Consultations Schedule (`ROLE_DOCTOR`)
- `GET /api/v1/appointments/{bookingId}` - Get Appointment by Booking ID
- `POST /api/v1/appointments/prescription` - Issue Digital Prescription (`ROLE_DOCTOR`)

---

## ⚡ How to Run CareConnect

### Option A: Using Docker Compose (Recommended)

1. Clone repository and set up environment variables:
   ```bash
   cp .env.example .env
   ```
2. Launch complete environment:
   ```bash
   docker compose up --build
   ```
3. Access Application:
   - **React Frontend**: `http://localhost:3000`
   - **Spring Boot Backend**: `http://localhost:8080`
   - **Swagger OpenAPI Docs**: `http://localhost:8080/swagger-ui.html`

### Option B: Running Locally

#### 1. Start PostgreSQL
Ensure PostgreSQL is running locally on port 5432 and database `careconnect_db` is created.

#### 2. Run Spring Boot Backend
```bash
cd CareConnect-Backend
./mvnw spring-boot:run
```

#### 3. Run React Frontend
```bash
cd CareConnect-Frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

### Run Backend Unit & Integration Tests
```bash
cd CareConnect-Backend
./mvnw test
```

### Run Frontend Production Build Validation
```bash
cd CareConnect-Frontend
npm run build
```

---

## 📄 License & Attribution
Developed for **CareConnect – Doctor Discovery & Consultation Platform**. Designed for modern microservices and monolithic deployment architectures.
