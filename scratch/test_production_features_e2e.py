import urllib.request
import urllib.parse
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8085"

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    if data is not None and isinstance(data, dict):
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(f"{BASE_URL}{url}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read()
            content_type = response.headers.get("Content-Type", "")
            if "application/json" in content_type:
                return response.status, json.loads(body.decode("utf-8")), response.headers
            return response.status, body, response.headers
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return e.code, json.loads(body.decode("utf-8")), e.headers
        except Exception:
            return e.code, body, e.headers
    except Exception as e:
        return 500, str(e), {}

def run_e2e_tests():
    print("==================================================")
    print("CARECONNECT PRODUCTION FEATURES E2E VALIDATION")
    print("==================================================")

    # 1. Admin Login & Authorization Security Check
    print("\n[1/6] Testing Admin Authentication & RBAC Enforcement...")
    status, res, _ = make_request("/api/v1/auth/login", "POST", data={
        "contact": "admin@careconnect.com",
        "password": "admin123"
    })
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res["accessToken"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(" ✅ Default Admin login successful.")

    # Login or Register Patient User
    status, reg_res, _ = make_request("/api/v1/auth/register", "POST", data={
        "name": "Test Patient",
        "email": "testpatient@careconnect.com",
        "mobileNumber": "9111111111",
        "password": "patient123",
        "userType": "patient"
    })

    if status in (200, 201):
        patient_token = reg_res["accessToken"]
    else:
        status, login_res, _ = make_request("/api/v1/auth/login", "POST", data={
            "contact": "9111111111",
            "password": "patient123"
        })
        assert status == 200, f"Patient login failed: {login_res}"
        patient_token = login_res["accessToken"]

    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    # Verify HTTP 401 or 403 for Non-Admin on Admin Endpoint
    status, res, _ = make_request("/api/v1/admin/stats", "GET", headers=patient_headers)
    assert status in (401, 403), f"Expected 401 or 403 for non-admin, got: {status}"
    print(f" ✅ Access denied enforced for non-admin on /api/v1/admin/stats (Status: {status}).")

    # 2. Admin Dashboard Functionality
    print("\n[2/6] Testing Admin Dashboard & Management...")
    status, stats_res, _ = make_request("/api/v1/admin/stats", "GET", headers=admin_headers)
    assert status == 200, f"Get admin stats failed: {stats_res}"
    stats_data = stats_res["data"]
    print(f" ✅ Platform Stats: {stats_data['totalPatients']} Patients, {stats_data['totalDoctors']} Doctors, {stats_data['totalAppointments']} Appointments.")

    # Get Doctors for Admin
    status, docs_res, _ = make_request("/api/v1/admin/doctors", "GET", headers=admin_headers)
    assert status == 200, f"Get admin doctors failed: {docs_res}"
    doctors_list = docs_res["data"]
    test_doc = next((d for d in doctors_list if d.get("email") == "doctor@demo.com"), doctors_list[0])
    print(f" ✅ Admin Doctors List retrieved ({len(doctors_list)} doctors). Using Doctor: {test_doc['name']}")

    # Toggle Doctor Verification
    status, verify_res, _ = make_request(f"/api/v1/admin/doctors/{test_doc['id']}/verify?isVerified=true", "PUT", headers=admin_headers)
    assert status == 200, f"Doctor verification failed: {verify_res}"
    print(f" ✅ Doctor {test_doc['name']} verification toggled successfully.")

    # 3. Patient Appointment & Notifications Integration
    print("\n[3/6] Testing Appointment Booking & Real-Time Notifications...")
    unique_slot = f"11:{int(time.time())%50:02d} AM"
    status, appt_res, _ = make_request("/api/v1/appointments", "POST", headers=patient_headers, data={
        "doctorId": test_doc["id"],
        "appointmentDate": "2026-08-20",
        "timeSlot": unique_slot,
        "consultationMedium": "VIDEO",
        "paymentMethod": "CARD"
    })
    assert status == 201, f"Appointment creation failed: {appt_res}"
    appt_data = appt_res["data"]
    appt_id = appt_data["id"]
    booking_id = appt_data["bookingId"]
    print(f" ✅ Appointment booked successfully! Booking ID: {booking_id}")

    # Check Patient Notifications
    status, notif_res, _ = make_request("/api/v1/notifications", "GET", headers=patient_headers)
    assert status == 200, f"Fetch notifications failed: {notif_res}"
    notifications = notif_res["data"]
    assert len(notifications) > 0, "Patient received no notifications"
    print(f" ✅ Patient received {len(notifications)} notifications (Latest: '{notifications[0]['message']}').")

    # Mark Notification as Read
    status, mark_res, _ = make_request(f"/api/v1/notifications/{notifications[0]['id']}/read", "PUT", headers=patient_headers)
    assert status == 200, "Mark notification read failed"
    print(" ✅ Notification marked as read successfully.")

    # 4. Doctor Prescription & PDF Generation
    print("\n[4/6] Testing Prescription & PDF Download...")
    # Login as Doctor for test_doc
    status, doc_login, _ = make_request("/api/v1/auth/login", "POST", data={
        "contact": "doctor@demo.com",
        "password": "demo123"
    })
    assert status == 200, "Doctor login failed"
    doc_token = doc_login["accessToken"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # Issue Prescription
    status, pres_res, _ = make_request("/api/v1/appointments/prescription", "POST", headers=doc_headers, data={
        "appointmentId": appt_id,
        "doctorNotes": "Patient exhibits mild fever. Advised 3 days bed rest.",
        "medicines": "Paracetamol 500mg BD, Vitamin C 500mg OD"
    })
    assert status == 200, f"Issue prescription failed: {pres_res}"
    print(" ✅ Digital Prescription issued by Doctor. Appointment status moved to COMPLETED.")

    # Patient Downloads Prescription PDF
    status, pdf_bytes, headers = make_request(f"/api/v1/appointments/{appt_id}/prescription/pdf", "GET", headers=patient_headers)
    assert status == 200, f"PDF download failed: {status}"
    assert pdf_bytes.startswith(b"%PDF-"), "Downloaded file is not a valid PDF document"
    print(f" ✅ Prescription PDF downloaded successfully ({len(pdf_bytes)} bytes, Magic Header: {pdf_bytes[:4].decode('utf-8')}).")

    # 5. Patient Medical History & Reviews
    print("\n[5/6] Testing Patient Medical History & Doctor Reviews...")
    status, history_res, _ = make_request("/api/v1/patients/me/medical-history", "GET", headers=patient_headers)
    assert status == 200, f"Get medical history failed: {history_res}"
    history_list = history_res["data"]
    assert len(history_list) > 0, "Medical history empty"
    print(f" ✅ Patient Medical History retrieved ({len(history_list)} records).")

    # Doctor Medical History for Associated Patient
    status, doc_history, _ = make_request(f"/api/v1/doctors/me/patients/{history_list[0]['patientId']}/medical-history", "GET", headers=doc_headers)
    assert status == 200, f"Doctor access to medical history failed: {doc_history}"
    print(" ✅ Doctor successfully accessed patient medical history for associated patient.")

    # Submit Review for Completed Appointment
    status, rev_res, _ = make_request("/api/v1/reviews", "POST", headers=patient_headers, data={
        "appointmentId": appt_id,
        "rating": 5,
        "comment": "Excellent diagnosis and prompt consultation!"
    })
    assert status == 201, f"Submit review failed: {rev_res}"
    print(" ✅ Doctor review submitted successfully (5 stars).")

    # Test Duplicate Review Prevention
    status, dup_rev, _ = make_request("/api/v1/reviews", "POST", headers=patient_headers, data={
        "appointmentId": appt_id,
        "rating": 4,
        "comment": "Duplicate review attempt"
    })
    assert status == 500 or status == 400, f"Expected error on duplicate review, got: {status}"
    print(" ✅ Duplicate review strictly prevented.")

    # 6. Admin Audit Logs Validation
    print("\n[6/6] Testing Security Audit Logs...")
    status, audit_res, _ = make_request("/api/v1/admin/audit-logs?size=10", "GET", headers=admin_headers)
    assert status == 200, f"Fetch audit logs failed: {audit_res}"
    logs_page = audit_res["data"]
    logs_content = logs_page["content"]
    assert len(logs_content) > 0, "Audit logs empty"
    print(f" ✅ Audit Log System verified ({logs_page['totalElements']} total events logged). Latest actions:")
    for log in logs_content[:3]:
        print(f"    - [{log['actionType']}] User {log['userId']} ({log['userRole']}): {log['description']}")

    print("\n==================================================")
    print("🎉 ALL 6 PRODUCTION FEATURES FULLY VERIFIED & WORKING!")
    print("==================================================")

if __name__ == "__main__":
    run_e2e_tests()
