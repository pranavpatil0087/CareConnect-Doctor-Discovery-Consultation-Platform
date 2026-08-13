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

        try {
            AppointmentStatus newStatus = AppointmentStatus.valueOf(statusStr.toUpperCase());
            appointment.setStatus(newStatus);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid appointment status: " + statusStr);
        }

        Appointment updated = appointmentRepository.save(appointment);
        return mapToDto(updated);
    }

    @Transactional
    public PrescriptionDto addPrescription(PrescriptionRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        Prescription prescription = prescriptionRepository.findByAppointmentId(request.getAppointmentId())
                .orElseGet(() -> Prescription.builder().appointment(appointment).build());

        prescription.setDoctorNotes(request.getDoctorNotes());
        prescription.setMedicines(request.getMedicines());

        Prescription saved = prescriptionRepository.save(prescription);

        return PrescriptionDto.builder()
                .id(saved.getId())
                .appointmentId(appointment.getId())
                .doctorNotes(saved.getDoctorNotes())
                .medicines(saved.getMedicines())
                .createdAt(saved.getCreatedAt())
                .build();
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
