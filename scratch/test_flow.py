import urllib.request
import json
import random

base_url = "http://localhost:8085"

rand_id = random.randint(1000, 9999)
doc_phone = f"98765{rand_id}"
doc_email = f"dr.fleming{rand_id}@careconnect.com"

# 1. Register Doctor
doc_payload = {
    "name": "Dr. Alexander Fleming",
    "mobileNumber": doc_phone,
    "email": doc_email,
    "password": "DoctorPass123!",
    "degree": "MBBS, MD",
    "licenseNumber": "MCI-998877",
    "specialization": "Cardiology",
    "experience": 12,
    "fees": 1000,
    "workingOn": "Fleming Heart Clinic",
    "clinicName": "Fleming Heart Clinic",
    "city": "Mumbai",
    "languages": "English, Hindi, Marathi",
    "bio": "Pioneer in cardiac care with over 12 years of clinical excellence.",
    "profilePictureUrl": "/uploads/doctor_demo.png",
    "userType": "doctor"
}

req = urllib.request.Request(
    f"{base_url}/api/v1/auth/register",
    data=json.dumps(doc_payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

doc_token = None
try:
    with urllib.request.urlopen(req) as resp:
        doc_res = json.loads(resp.read().decode('utf-8'))
        print("Doctor Registration Success:")
        print(json.dumps(doc_res, indent=2))
        doc_token = doc_res.get('accessToken')
except Exception as e:
    print("Doctor Registration Error:", e)

# 2. Search Doctors
doctor_profile_id = None
search_req = urllib.request.Request(f"{base_url}/api/v1/doctors/search")
try:
    with urllib.request.urlopen(search_req) as resp:
        doctors = json.loads(resp.read().decode('utf-8'))
        print(f"\nSearch Doctors Result Count: {len(doctors)}")
        for d in doctors:
            if d.get('email') == doc_email:
                print("Found Registered Doctor Profile with all Professional Info:")
                print(json.dumps(d, indent=2))
                doctor_profile_id = d.get('id')
except Exception as e:
    print("Search Doctors Error:", e)

# 3. Register Patient
patient_phone = f"98766{rand_id}"
patient_email = f"john.miller{rand_id}@example.com"
patient_payload = {
    "name": "John Miller",
    "mobileNumber": patient_phone,
    "email": patient_email,
    "password": "PatientPass123!",
    "userType": "patient"
}

p_req = urllib.request.Request(
    f"{base_url}/api/v1/auth/register",
    data=json.dumps(patient_payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

patient_token = None
try:
    with urllib.request.urlopen(p_req) as resp:
        p_res = json.loads(resp.read().decode('utf-8'))
        print("\nPatient Registration Success:")
        print(json.dumps(p_res, indent=2))
        patient_token = p_res.get('accessToken')
except Exception as e:
    print("Patient Registration Error:", e)

# 4. Book Appointment
appointment_id = None
booking_id = None
if patient_token and doctor_profile_id:
    booking_payload = {
        "doctorId": doctor_profile_id,
        "appointmentDate": "2026-08-15",
        "timeSlot": "10:30 AM",
        "consultationMedium": "VIDEO",
        "paymentMethod": "CARD"
    }
    b_req = urllib.request.Request(
        f"{base_url}/api/v1/appointments",
        data=json.dumps(booking_payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {patient_token}'
        }
    )
    try:
        with urllib.request.urlopen(b_req) as resp:
            b_res = json.loads(resp.read().decode('utf-8'))
            print("\nAppointment Booked Success:")
            print(json.dumps(b_res, indent=2))
            appointment_id = b_res['data']['id']
            booking_id = b_res['data']['bookingId']
    except Exception as e:
        print("Booking Error:", e)

# 5. Doctor Patient Database query
if doc_token:
    pd_req = urllib.request.Request(
        f"{base_url}/api/v1/doctors/me/patients",
        headers={
            'Authorization': f'Bearer {doc_token}'
        }
    )
    try:
        with urllib.request.urlopen(pd_req) as resp:
            pd_res = json.loads(resp.read().decode('utf-8'))
            print("\nDoctor Patient Database Query Success:")
            print(json.dumps(pd_res, indent=2))
    except Exception as e:
        print("Doctor Patient Database Error:", e)

# 6. Issue Prescription
if doc_token and appointment_id:
    rx_payload = {
        "appointmentId": appointment_id,
        "doctorNotes": "Patient has mild angina. ECG normal.",
        "medicines": "1. Aspirin 75mg daily\n2. Atorvastatin 10mg night"
    }
    rx_req = urllib.request.Request(
        f"{base_url}/api/v1/appointments/prescription",
        data=json.dumps(rx_payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {doc_token}'
        }
    )
    try:
        with urllib.request.urlopen(rx_req) as resp:
            rx_res = json.loads(resp.read().decode('utf-8'))
            print("\nPrescription Issued Success:")
            print(json.dumps(rx_res, indent=2))
    except Exception as e:
        print("Prescription Error:", e)

# 7. Patient View Appointment Details & Prescription
if booking_id and patient_token:
    app_req = urllib.request.Request(
        f"{base_url}/api/v1/appointments/{booking_id}",
        headers={
            'Authorization': f'Bearer {patient_token}'
        }
    )
    try:
        with urllib.request.urlopen(app_req) as resp:
            app_res = json.loads(resp.read().decode('utf-8'))
            print("\nPatient Viewed Appointment Details & Issued Prescription Success:")
            print(json.dumps(app_res, indent=2))
    except Exception as e:
        print("Patient View Appointment Error:", e)
