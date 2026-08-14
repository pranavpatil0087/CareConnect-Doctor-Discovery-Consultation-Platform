package com.careconnect;

import com.careconnect.dto.request.AppointmentCreateRequest;
import com.careconnect.dto.response.AppointmentDto;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.User;
import com.careconnect.exception.ConflictException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.DoctorProfileRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.service.AppointmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AppointmentServiceTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private com.careconnect.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.careconnect.repository.AuditLogRepository auditLogRepository;

    @Autowired
    private com.careconnect.repository.ReviewRepository reviewRepository;

    @Autowired
    private com.careconnect.repository.PrescriptionRepository prescriptionRepository;

    @Autowired
    private com.careconnect.repository.PatientProfileRepository patientProfileRepository;

    private User patientUser;
    private DoctorProfile doctorProfile;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        auditLogRepository.deleteAll();
        reviewRepository.deleteAll();
        prescriptionRepository.deleteAll();
        appointmentRepository.deleteAll();
        doctorProfileRepository.deleteAll();
        patientProfileRepository.deleteAll();
        userRepository.deleteAll();

        patientUser = userRepository.save(User.builder()
                .name("Test Patient")
                .mobileNumber("9998887771")
                .email("patient@test.com")
                .password("password")
                .build());

        User doctorUser = userRepository.save(User.builder()
                .name("Dr. Test")
                .mobileNumber("9998887772")
                .email("doctor@test.com")
                .password("password")
                .build());

        doctorProfile = doctorProfileRepository.save(DoctorProfile.builder()
                .user(doctorUser)
                .fees(500)
                .isAvailable(true)
                .build());
    }

    @Test
    void testCreateAppointmentSuccess() {
        AppointmentCreateRequest req = new AppointmentCreateRequest();
        req.setDoctorId(doctorProfile.getId());
        req.setAppointmentDate(LocalDate.now().plusDays(1));
        req.setTimeSlot("10:00 AM");
        req.setConsultationMedium("VIDEO");
        req.setPaymentMethod("CARD");

        AppointmentDto dto = appointmentService.createAppointment(patientUser.getId(), req);

        assertNotNull(dto);
        assertNotNull(dto.getBookingId());
        assertEquals("BOOKED", dto.getStatus());
        assertEquals("Dr. Test", dto.getDoctorName());
    }

    @Test
    void testCreateAppointmentConflictThrowsException() {
        AppointmentCreateRequest req = new AppointmentCreateRequest();
        req.setDoctorId(doctorProfile.getId());
        req.setAppointmentDate(LocalDate.now().plusDays(1));
        req.setTimeSlot("10:00 AM");
        req.setConsultationMedium("VIDEO");

        appointmentService.createAppointment(patientUser.getId(), req);

        assertThrows(ConflictException.class, () -> {
            appointmentService.createAppointment(patientUser.getId(), req);
        });
    }
}
