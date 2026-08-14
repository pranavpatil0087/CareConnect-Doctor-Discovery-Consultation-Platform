package com.careconnect.service;

import com.careconnect.dto.request.AppointmentCreateRequest;
import com.careconnect.dto.request.PrescriptionRequest;
import com.careconnect.dto.response.AppointmentDto;
import com.careconnect.dto.response.PrescriptionDto;
import com.careconnect.entity.Appointment;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.Prescription;
import com.careconnect.entity.User;
import com.careconnect.entity.enums.AppointmentStatus;
import com.careconnect.entity.enums.ConsultationMedium;
import com.careconnect.exception.BadRequestException;
import com.careconnect.exception.ConflictException;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.DoctorProfileRepository;
import com.careconnect.repository.PrescriptionRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.entity.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final PdfGeneratorService pdfGeneratorService;

    @Transactional
    public AppointmentDto createAppointment(Long patientUserId, AppointmentCreateRequest request) {
        User patient = userRepository.findById(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientUserId));

        DoctorProfile doctor = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile", "id", request.getDoctorId()));

        if (Boolean.FALSE.equals(doctor.getIsAvailable())) {
            throw new BadRequestException("Doctor is currently not available for bookings.");
        }

        boolean slotExists = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlot(
                doctor.getId(), request.getAppointmentDate(), request.getTimeSlot());

        if (slotExists) {
            throw new ConflictException("The selected time slot ('" + request.getTimeSlot() + "') on " + request.getAppointmentDate() + " is already booked.");
        }

        String bookingId = "CC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ConsultationMedium medium = ConsultationMedium.VIDEO;
        if (request.getConsultationMedium() != null) {
            try {
                medium = ConsultationMedium.valueOf(request.getConsultationMedium().toUpperCase());
            } catch (IllegalArgumentException ex) {
                medium = ConsultationMedium.VIDEO;
            }
        }

        Appointment appointment = Appointment.builder()
                .bookingId(bookingId)
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .status(AppointmentStatus.BOOKED)
                .consultationMedium(medium)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD")
                .amountPaid(BigDecimal.valueOf(doctor.getFees()))
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Send notifications
        notificationService.createNotification(
                patient.getId(),
                NotificationType.BOOKED,
                "Appointment " + bookingId + " successfully booked with Dr. " + doctor.getUser().getName() + " for " + request.getAppointmentDate() + " at " + request.getTimeSlot() + ".",
                saved.getId()
        );

        notificationService.createNotification(
                doctor.getUser().getId(),
                NotificationType.NEW_APPOINTMENT,
                "New consultation booked by " + patient.getName() + " for " + request.getAppointmentDate() + " at " + request.getTimeSlot() + ".",
                saved.getId()
        );

        // Audit Log
        auditLogService.logEvent(patientUserId, "ROLE_PATIENT", "APPOINTMENT_BOOKED", "APPOINTMENT", saved.getId().toString(), "Booked appointment " + bookingId + " with Dr. " + doctor.getUser().getName(), null);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsForPatient(Long patientUserId) {
        List<Appointment> list = appointmentRepository.findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(patientUserId);
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsForDoctor(Long doctorUserId) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + doctorUserId));

        List<Appointment> list = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(doctor.getId());
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentDto getAppointmentByBookingId(String bookingId) {
        Appointment appointment = appointmentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "bookingId", bookingId));
        return mapToDto(appointment);
    }

    @Transactional
    public AppointmentDto updateAppointmentStatus(Long appointmentId, String statusStr) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        Long actingUserId = null;
        String actingRole = "USER";

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.careconnect.security.UserPrincipal principal) {
            actingUserId = principal.getId();
            actingRole = principal.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("USER");
            boolean isDoctorForAppt = appointment.getDoctor().getUser().getId().equals(principal.getId());
            boolean isPatientForAppt = appointment.getPatient().getId().equals(principal.getId());
            boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isDoctorForAppt && !isPatientForAppt && !isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("You are not authorized to update this appointment.");
            }
        }

        try {
            AppointmentStatus newStatus = AppointmentStatus.valueOf(statusStr.toUpperCase());
            appointment.setStatus(newStatus);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid appointment status: " + statusStr);
        }

        Appointment updated = appointmentRepository.save(appointment);

        // Notifications
        NotificationType notifType = updated.getStatus() == AppointmentStatus.CANCELLED ? NotificationType.CANCELLED : NotificationType.STATUS_CHANGED;
        String msg = "Appointment " + updated.getBookingId() + " status updated to " + updated.getStatus();
        notificationService.createNotification(updated.getPatient().getId(), notifType, msg, updated.getId());
        notificationService.createNotification(updated.getDoctor().getUser().getId(), notifType, msg, updated.getId());

        auditLogService.logEvent(actingUserId, actingRole, "APPOINTMENT_STATUS_UPDATE", "APPOINTMENT", updated.getId().toString(), "Updated appointment " + updated.getBookingId() + " status to " + updated.getStatus(), null);

        return mapToDto(updated);
    }

    @Transactional
    public PrescriptionDto addPrescription(PrescriptionRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        Long doctorUserId = null;
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.careconnect.security.UserPrincipal principal) {
            doctorUserId = principal.getId();
            if (!appointment.getDoctor().getUser().getId().equals(principal.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You are not authorized to issue a prescription for this appointment.");
            }
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        Prescription prescription = prescriptionRepository.findByAppointmentId(request.getAppointmentId())
                .orElseGet(() -> Prescription.builder().appointment(appointment).build());

        prescription.setDoctorNotes(request.getDoctorNotes());
        prescription.setMedicines(request.getMedicines());

        Prescription saved = prescriptionRepository.save(prescription);

        // Notifications & Audit Log
        notificationService.createNotification(
                appointment.getPatient().getId(),
                NotificationType.STATUS_CHANGED,
                "Dr. " + appointment.getDoctor().getUser().getName() + " has issued a digital prescription for appointment " + appointment.getBookingId() + ".",
                appointment.getId()
        );

        auditLogService.logEvent(doctorUserId, "ROLE_DOCTOR", "PRESCRIPTION_CREATED", "PRESCRIPTION", saved.getId().toString(), "Issued digital prescription for appointment " + appointment.getBookingId(), null);

        return PrescriptionDto.builder()
                .id(saved.getId())
                .appointmentId(appointment.getId())
                .doctorNotes(saved.getDoctorNotes())
                .medicines(saved.getMedicines())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public byte[] getPrescriptionPdf(Long appointmentId, Long currentUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        boolean isPatient = appointment.getPatient().getId().equals(currentUserId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(currentUserId);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isPatient && !isDoctor && !isAdmin) {
            auditLogService.logEvent(currentUserId, "USER", "UNAUTHORIZED_ACCESS", "PRESCRIPTION_PDF", appointmentId.toString(), "Unauthorized prescription PDF download attempt", null);
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to download this prescription.");
        }

        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found for appointment: " + appointmentId));

        auditLogService.logEvent(currentUserId, isPatient ? "ROLE_PATIENT" : (isDoctor ? "ROLE_DOCTOR" : "ROLE_ADMIN"), "PRESCRIPTION_DOWNLOADED", "PRESCRIPTION_PDF", prescription.getId().toString(), "Downloaded prescription PDF for appointment " + appointment.getBookingId(), null);

        return pdfGeneratorService.generatePrescriptionPdf(appointment, prescription);
    }

    public AppointmentDto mapToDto(Appointment entity) {
        if (entity == null) return null;

        PrescriptionDto prescriptionDto = null;
        if (entity.getId() != null) {
            prescriptionDto = prescriptionRepository.findByAppointmentId(entity.getId())
                    .map(p -> PrescriptionDto.builder()
                            .id(p.getId())
                            .appointmentId(entity.getId())
                            .doctorNotes(p.getDoctorNotes())
                            .medicines(p.getMedicines())
                            .createdAt(p.getCreatedAt())
                            .build())
                    .orElse(null);
        }

        return AppointmentDto.builder()
                .id(entity.getId())
                .bookingId(entity.getBookingId())
                .patientId(entity.getPatient().getId())
                .patientName(entity.getPatient().getName())
                .doctorId(entity.getDoctor().getId())
                .doctorUserId(entity.getDoctor().getUser().getId())
                .doctorName(entity.getDoctor().getUser().getName())
                .doctorSpecialization(entity.getDoctor().getSpeciality() != null ? entity.getDoctor().getSpeciality().getName() : "General")
                .appointmentDate(entity.getAppointmentDate())
                .timeSlot(entity.getTimeSlot())
                .status(entity.getStatus().name())
                .consultationMedium(entity.getConsultationMedium().name())
                .paymentMethod(entity.getPaymentMethod())
                .amountPaid(entity.getAmountPaid())
                .createdAt(entity.getCreatedAt())
                .prescription(prescriptionDto)
                .build();
    }
}
