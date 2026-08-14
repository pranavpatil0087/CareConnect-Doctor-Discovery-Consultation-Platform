import urllib.request
import json
import random
import time
import subprocess

base_url = "http://localhost:8085"
rand = random.randint(100000, 999999)

print("==================================================")
print("CARECONNECT FINAL E2E STABILITY & VERIFICATION")
print("==================================================")

# 1. Health Check GET / & GET /api/health -> Expect HTTP 200 OK
with urllib.request.urlopen(f"{base_url}/") as resp:
    assert resp.status == 200, "GET / failed!"
    data_root = json.loads(resp.read().decode('utf-8'))
    print("1. GET / Root Endpoint:", data_root)
    assert data_root.get("status") == "UP", "Health status is not UP!"

with urllib.request.urlopen(f"{base_url}/api/health") as resp:
    assert resp.status == 200, "GET /api/health failed!"
    data_health = json.loads(resp.read().decode('utf-8'))
    print("2. GET /api/health Endpoint:", data_health)
    assert data_health.get("status") == "UP"

# 2. Patient Registration & Login
pat_email = f"patient_{rand}@test.com"
pat_payload = {
    "name": "Alex Patient",
    "mobileNumber": f"877{rand}",
    "email": pat_email,
    "password": "Password123!",
    "userType": "patient"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/auth/register", data=json.dumps(pat_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})) as resp:
    pat_res = json.loads(resp.read().decode('utf-8'))
    pat_token = pat_res['accessToken']
    pat_user_id = pat_res['userId']
    print(f"3. Registered Patient ({pat_email}) with User ID: {pat_user_id}")

# 3. Doctor Registration with Full Professional Info
doc_email = f"dr_spec_{rand}@careconnect.com"
doc_img_url = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80"
doc_payload = {
    "name": "Dr. Kavita Deshmukh",
    "mobileNumber": f"977{rand}",
    "email": doc_email,
    "password": "Password123!",
    "userType": "doctor",
    "specialization": "Cardiology",
    "degree": "MBBS, MD (Cardiology)",
    "licenseNumber": f"MCI-{rand}",
    "clinicName": "Deshmukh Heart Specialty Clinic",
    "city": "Pune",
    "fees": 950,
    "languages": "English, Marathi, Hindi",
    "bio": "Expert Cardiologist with 11 years of experience in cardiology.",
    "profilePictureUrl": doc_img_url
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/auth/register", data=json.dumps(doc_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})) as resp:
    doc_res = json.loads(resp.read().decode('utf-8'))
    doc_token = doc_res['accessToken']
    doc_user_id = doc_res['userId']
    print(f"4. Registered Doctor ({doc_email}) with User ID: {doc_user_id}")

# 4. Doctor Search & Listing Verification
with urllib.request.urlopen(f"{base_url}/api/v1/doctors/search") as resp:
    doctors = json.loads(resp.read().decode('utf-8'))
    print(f"5. Total Doctors Found in Search: {len(doctors)}")
    
    # Check for newly registered doctor
    registered_doc = [d for d in doctors if d['email'] == doc_email][0]
    print("   Registered Doctor Profile Picture:", registered_doc['profilePictureUrl'])
    assert registered_doc['profilePictureUrl'] == doc_img_url, "Doctor profile image URL mismatch!"
    assert registered_doc['degree'] == "MBBS, MD (Cardiology)", "Degree mismatch!"
    assert registered_doc['clinicName'] == "Deshmukh Heart Specialty Clinic", "Clinic name mismatch!"

    # Verify no generic duplicate doctors
    doc_names = [d['name'] for d in doctors]
    print("   Doctor Names in Database:", doc_names)
    assert "Dr. Doctor One" not in doc_names, "Generic duplicate doctor found!"

    doc_profile_id = registered_doc['id']

# 5. Patient Books Appointment
book_payload = {
    "doctorId": doc_profile_id,
    "appointmentDate": "2026-08-25",
    "timeSlot": "10:30 AM",
    "consultationMedium": "VIDEO"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments", data=json.dumps(book_payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {pat_token}'})) as resp:
    b_res = json.loads(resp.read().decode('utf-8'))
    appt_data = b_res['data']
    booking_id = appt_data['bookingId']
    appt_id = appt_data['id']
    print(f"6. Appointment Booked Successfully. Booking ID: {booking_id}")
    print(f"   Patient ID in Appt: {appt_data.get('patientId')} (Expected: {pat_user_id})")
    print(f"   Doctor User ID in Appt: {appt_data.get('doctorUserId')} (Expected: {doc_user_id})")
    assert appt_data.get('patientId') == pat_user_id, "Appointment patientId mismatch!"
    assert appt_data.get('doctorUserId') == doc_user_id, "Appointment doctorUserId mismatch!"

# 6. Patient Video Call Authorization Check
# Simulate client side authorization evaluation for patient
pat_current_id = pat_user_id
pat_is_assigned_patient = appt_data['patientId'] and appt_data['patientId'] == pat_current_id
print(f"7. Patient Video Call Participant Verification: Authorized = {pat_is_assigned_patient}")
assert pat_is_assigned_patient == True, "Patient Video Call Authorization Failed!"

# 7. Doctor Video Call Authorization Check
# Simulate client side authorization evaluation for doctor
doc_current_id = doc_user_id
doc_is_assigned_doctor = (appt_data.get('doctorUserId') and appt_data['doctorUserId'] == doc_current_id)
print(f"8. Doctor Video Call Participant Verification: Authorized = {doc_is_assigned_doctor}")
assert doc_is_assigned_doctor == True, "Doctor Video Call Authorization Failed!"

# 8. Doctor Patient Database Query
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/doctors/me/patients", headers={'Authorization': f'Bearer {doc_token}'})) as resp:
    pat_db_res = json.loads(resp.read().decode('utf-8'))
    patients_list = pat_db_res['data']
    print(f"9. Doctor Patient Database Records Count: {len(patients_list)}")
    assert len(patients_list) >= 1, "Patient Database did not return booked patient!"
    assert patients_list[0]['email'] == pat_email, "Patient record email mismatch!"

# 9. Doctor Writes Digital Prescription
rx_payload = {
    "appointmentId": appt_id,
    "doctorNotes": "ECG normal. Continue preventative lifestyle care.",
    "medicines": "Tab. Aspirin 75mg OD x 30 days"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments/prescription", data=json.dumps(rx_payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {doc_token}'})) as resp:
    rx_res = json.loads(resp.read().decode('utf-8'))
    print("10. Digital Prescription Issued Successfully.")

# 10. Patient Views Appointment Details & Prescription
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments/{booking_id}", headers={'Authorization': f'Bearer {pat_token}'})) as resp:
    appt_details = json.loads(resp.read().decode('utf-8'))
    print("11. Updated Appointment Status:", appt_details['status'])
    assert appt_details['status'] == "COMPLETED", "Appointment status not COMPLETED!"
    assert appt_details['prescription'] is not None, "Prescription missing from appointment details!"
    print("    Prescription Notes:", appt_details['prescription']['doctorNotes'])
    print("    Prescription Medicines:", appt_details['prescription']['medicines'])

# 11. Docker Container Restart Test
print("\n12. Restarting Docker Backend Container to verify persistence...")
subprocess.run(["docker", "compose", "restart", "backend"], check=True)
time.sleep(12) # Wait for backend restart

# Verify Health Check & Data Persistence after Container Restart
with urllib.request.urlopen(f"{base_url}/api/health") as resp:
    assert resp.status == 200, "Health check failed after Docker restart!"
    print("13. Health Check Post-Restart: HTTP 200 OK (UP)")

with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments/{booking_id}", headers={'Authorization': f'Bearer {pat_token}'})) as resp:
    post_restart_appt = json.loads(resp.read().decode('utf-8'))
    assert post_restart_appt['prescription']['doctorNotes'] == "ECG normal. Continue preventative lifestyle care."
    print("14. Prescription Persisted 100% Intact After Docker Restart!")

print("\n==================================================")
print("ALL E2E STABILITY & FUNCTIONAL TESTS PASSED 100%!")
print("==================================================")
