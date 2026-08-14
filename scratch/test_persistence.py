import urllib.request
import json
import random
import subprocess
import time

base_url = "http://localhost:8085"
rand = random.randint(100000, 999999)

# 1. Register Doctor with image
doc_payload = {
    "name": "Dr. Persistence Test",
    "mobileNumber": f"9{rand}",
    "email": f"persist_{rand}@careconnect.com",
    "password": "Password123!",
    "userType": "doctor",
    "specialization": "Neurology",
    "fees": 1200,
    "profilePictureUrl": "/uploads/persisted_doctor.png"
}

with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/auth/register", data=json.dumps(doc_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})) as resp:
    doc_res = json.loads(resp.read().decode('utf-8'))
    doc_token = doc_res['accessToken']

# Find doctor profile ID
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/doctors/search")) as resp:
    doctors = json.loads(resp.read().decode('utf-8'))
    doc_id = [d['id'] for d in doctors if d['email'] == f"persist_{rand}@careconnect.com"][0]

# 2. Register Patient & Book Appointment
pat_payload = {
    "name": "Patient Persistence Test",
    "mobileNumber": f"8{rand}",
    "email": f"pat_persist_{rand}@example.com",
    "password": "Password123!",
    "userType": "patient"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/auth/register", data=json.dumps(pat_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})) as resp:
    pat_res = json.loads(resp.read().decode('utf-8'))
    pat_token = pat_res['accessToken']

book_payload = {
    "doctorId": doc_id,
    "appointmentDate": "2026-08-20",
    "timeSlot": "02:00 PM",
    "consultationMedium": "VIDEO"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments", data=json.dumps(book_payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {pat_token}'})) as resp:
    b_res = json.loads(resp.read().decode('utf-8'))
    booking_id = b_res['data']['bookingId']
    appt_id = b_res['data']['id']

# 3. Issue Prescription
rx_payload = {
    "appointmentId": appt_id,
    "doctorNotes": "Persistent diagnosis: Migraine headache",
    "medicines": "Sumatriptan 50mg PRN"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments/prescription", data=json.dumps(rx_payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {doc_token}'})) as resp:
    rx_res = json.loads(resp.read().decode('utf-8'))

print("Pre-restart setup complete. Booking ID:", booking_id)
print("Persisted Doctor Profile Picture:", "/uploads/persisted_doctor.png")

# 4. Restart Docker backend
print("Restarting docker-compose backend container...")
subprocess.run(["docker", "compose", "restart", "backend"], check=True)
time.sleep(12)  # Wait for container startup

# 5. Verify Doctor Profile Image & Prescription after Docker restart
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/doctors/search")) as resp:
    doctors_after = json.loads(resp.read().decode('utf-8'))
    doc_after = [d for d in doctors_after if d['email'] == f"persist_{rand}@careconnect.com"][0]
    print("\nPost-Restart Doctor Profile Image URL:", doc_after['profilePictureUrl'])
    assert doc_after['profilePictureUrl'] == "/uploads/persisted_doctor.png", "Doctor Profile Picture failed persistence check!"

with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments/{booking_id}", headers={'Authorization': f'Bearer {pat_token}'})) as resp:
    appt_after = json.loads(resp.read().decode('utf-8'))
    print("Post-Restart Prescription Notes:", appt_after['prescription']['doctorNotes'])
    assert appt_after['prescription']['doctorNotes'] == "Persistent diagnosis: Migraine headache", "Prescription failed persistence check!"

print("\nPERSISTENCE VERIFICATION PASSED 100%!")
