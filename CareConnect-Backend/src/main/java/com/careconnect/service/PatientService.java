package com.careconnect.service;

import com.careconnect.dto.response.MedicalHistoryDto;
import com.careconnect.dto.response.PatientDto;
import com.careconnect.entity.Appointment;
import com.careconnect.entity.PatientProfile;
import com.careconnect.entity.Prescription;
import com.careconnect.entity.User;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.PatientProfileRepository;
import com.careconnect.repository.PrescriptionRepository;
import com.careconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Transactional(readOnly = true)
    public PatientDto getPatientProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        PatientProfile patient = patientProfileRepository.findByUserId(userId)
                .orElseGet(() -> patientProfileRepository.save(PatientProfile.builder().user(user).build()));

        return mapToDto(patient);
    }

    @Transactional
    public PatientDto updatePatientProfile(Long userId, PatientDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        PatientProfile patient = patientProfileRepository.findByUserId(userId)
                .orElseGet(() -> patientProfileRepository.save(PatientProfile.builder().user(user).build()));

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getMobileNumber() != null) user.setMobileNumber(dto.getMobileNumber());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getState() != null) user.setState(dto.getState());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        userRepository.save(user);

        if (dto.getMedicalHistory() != null) patient.setMedicalHistory(dto.getMedicalHistory());
        if (dto.getBloodGroup() != null) patient.setBloodGroup(dto.getBloodGroup());

        PatientProfile updated = patientProfileRepository.save(patient);
        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public List<MedicalHistoryDto> getMedicalHistoryForPatient(Long patientUserId) {
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(patientUserId);
        return appointments.stream().map(this::mapToMedicalHistoryDto).collect(Collectors.toList());
    }

    public MedicalHistoryDto mapToMedicalHistoryDto(Appointment appt) {
        Prescription prescription = prescriptionRepository.findByAppointmentId(appt.getId()).orElse(null);

        return MedicalHistoryDto.builder()
                .appointmentId(appt.getId())
                .bookingId(appt.getBookingId())
                .appointmentDate(appt.getAppointmentDate())
                .timeSlot(appt.getTimeSlot())
                .status(appt.getStatus().name())
                .consultationMedium(appt.getConsultationMedium().name())
                .doctorId(appt.getDoctor().getId().toString())
                .doctorName(appt.getDoctor().getUser().getName())
                .specialization(appt.getDoctor().getSpeciality() != null ? appt.getDoctor().getSpeciality().getName() : "General")
                .clinicName(appt.getDoctor().getClinicName())
                .patientId(appt.getPatient().getId())
                .patientName(appt.getPatient().getName())
                .prescriptionAvailable(prescription != null)
                .prescriptionId(prescription != null ? prescription.getId() : null)
                .doctorNotes(prescription != null ? prescription.getDoctorNotes() : null)
                .medicines(prescription != null ? prescription.getMedicines() : null)
                .prescriptionCreatedAt(prescription != null ? prescription.getCreatedAt() : null)
                .build();
    }

    public PatientDto mapToDto(PatientProfile entity) {
        if (entity == null) return null;
        User user = entity.getUser();

        return PatientDto.builder()
                .id(entity.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .age(user.getAge())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .profilePictureUrl(user.getProfilePictureUrl())
                .medicalHistory(entity.getMedicalHistory())
                .bloodGroup(entity.getBloodGroup())
                .build();
    }
}
