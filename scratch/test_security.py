import urllib.request
import json
import random

base_url = "http://localhost:8085"

rand = random.randint(10000, 99999)

# 1. Unauthenticated Request Test -> Expect 401
unauth_req = urllib.request.Request(f"{base_url}/api/v1/doctors/me/patients")
unauth_status = None
try:
    with urllib.request.urlopen(unauth_req) as resp:
        unauth_status = resp.status
except urllib.error.HTTPError as e:
    unauth_status = e.code
print(f"Unauthenticated request to protected endpoint: HTTP {unauth_status} (Expected 401)")

# 2. Patient Role calling Doctor-Only Endpoint -> Expect 403
p_payload = {
    "name": "Patient Security Test",
    "mobileNumber": f"91111{rand}",
    "email": f"patient_sec_{rand}@test.com",
    "password": "Password123!",
    "userType": "patient"
}
p_req = urllib.request.Request(
    f"{base_url}/api/v1/auth/register",
    data=json.dumps(p_payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
patient_token = None
with urllib.request.urlopen(p_req) as resp:
    p_res = json.loads(resp.read().decode('utf-8'))
    patient_token = p_res['accessToken']

pat_to_doc_req = urllib.request.Request(
    f"{base_url}/api/v1/doctors/me/patients",
    headers={'Authorization': f'Bearer {patient_token}'}
)
pat_to_doc_status = None
try:
    with urllib.request.urlopen(pat_to_doc_req) as resp:
        pat_to_doc_status = resp.status
except urllib.error.HTTPError as e:
    pat_to_doc_status = e.code
print(f"Patient calling Doctor-only /api/v1/doctors/me/patients: HTTP {pat_to_doc_status} (Expected 403)")

# 3. Doctor 1 vs Doctor 2 Patients Isolation Test
doc1_payload = {
    "name": "Dr. Doctor One",
    "mobileNumber": f"92222{rand}",
    "email": f"doc1_{rand}@test.com",
    "password": "Password123!",
    "userType": "doctor",
    "specialization": "Cardiology",
    "fees": 500
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/auth/register", data=json.dumps(doc1_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})) as resp:
    doc1_token = json.loads(resp.read().decode('utf-8'))['accessToken']

doc2_payload = {
    "name": "Dr. Doctor Two",
    "mobileNumber": f"93333{rand}",
    "email": f"doc2_{rand}@test.com",
    "password": "Password123!",
    "userType": "doctor",
    "specialization": "Dermatology",
    "fees": 600
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/auth/register", data=json.dumps(doc2_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})) as resp:
    doc2_token = json.loads(resp.read().decode('utf-8'))['accessToken']

# Get Doctor 1 profile ID
search_req = urllib.request.Request(f"{base_url}/api/v1/doctors/search")
with urllib.request.urlopen(search_req) as resp:
    doctors = json.loads(resp.read().decode('utf-8'))
    doc1_id = [d['id'] for d in doctors if d['email'] == f"doc1_{rand}@test.com"][0]

# Patient books with Doctor 1
book_payload = {
    "doctorId": doc1_id,
    "appointmentDate": "2026-08-16",
    "timeSlot": "11:00 AM",
    "consultationMedium": "VIDEO"
}
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments", data=json.dumps(book_payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {patient_token}'})) as resp:
    booking_res = json.loads(resp.read().decode('utf-8'))
    appt_id = booking_res['data']['id']

# Query Doctor 2 Patients Database -> Should return 0 patients for Doctor 2
with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/doctors/me/patients", headers={'Authorization': f'Bearer {doc2_token}'})) as resp:
    doc2_patients = json.loads(resp.read().decode('utf-8'))['data']
    print(f"Doctor 2 Patient Database count: {len(doc2_patients)} (Expected 0 - Doctor 2 cannot see Doctor 1's patients)")

# Doctor 2 attempts to issue prescription for Doctor 1's appointment
rx_payload = {
    "appointmentId": appt_id,
    "doctorNotes": "Unauthorized prescription attempt",
    "medicines": "N/A"
}
doc2_rx_status = None
try:
    with urllib.request.urlopen(urllib.request.Request(f"{base_url}/api/v1/appointments/prescription", data=json.dumps(rx_payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {doc2_token}'})) as resp:
        doc2_rx_status = resp.status
except urllib.error.HTTPError as e:
    doc2_rx_status = e.code
print(f"Doctor 2 attempting to prescribe for Doctor 1's appointment: HTTP {doc2_rx_status} (Expected 403 Forbidden)")
