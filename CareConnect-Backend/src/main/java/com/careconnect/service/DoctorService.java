package com.careconnect.service;

import com.careconnect.dto.request.AvailabilityUpdateRequest;
import com.careconnect.dto.response.DoctorDto;
import com.careconnect.dto.response.DoctorPatientDto;
import com.careconnect.entity.Appointment;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.PatientProfile;
import com.careconnect.entity.Speciality;
import com.careconnect.entity.User;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.careconnect.dto.response.MedicalHistoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final SpecialityRepository specialityRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final FileUploadService fileUploadService;
    private final PatientService patientService;
    private final AuditLogService auditLogService;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public DoctorDto getDoctorProfileByUserId(Long userId) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + userId));
        return mapToDto(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorDto getDoctorProfileById(UUID doctorId) {
        DoctorProfile doctor = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile", "id", doctorId));
        return mapToDto(doctor);
    }

    @Transactional(readOnly = true)
    public List<DoctorDto> getAllDoctors() {
        return doctorProfileRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorDto> searchDoctors(Integer specialityId, String speciality, String city, String name, Boolean isAvailable) {
        List<DoctorProfile> doctors = doctorProfileRepository.searchDoctors(specialityId, speciality, city, name, isAvailable);
        return doctors.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public DoctorDto updateDoctorProfile(Long userId, DoctorDto dto) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + userId));

        User user = doctor.getUser();
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getCity() != null) user.setCity(dto.getCity());
        if (dto.getState() != null) user.setState(dto.getState());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        if (dto.getProfilePictureUrl() != null) user.setProfilePictureUrl(dto.getProfilePictureUrl());
        userRepository.save(user);

        if (dto.getFees() != null) doctor.setFees(dto.getFees());
        if (dto.getExperience() != null) doctor.setExperienceYears(dto.getExperience());
        if (dto.getAvailability() != null) doctor.setIsAvailable(dto.getAvailability());
        if (dto.getWorkingOn() != null) doctor.setWorkingOn(dto.getWorkingOn());
        if (dto.getDegree() != null) doctor.setDegree(dto.getDegree());
        if (dto.getLicenseNumber() != null) doctor.setLicenseNumber(dto.getLicenseNumber());
        if (dto.getClinicName() != null) {
            doctor.setClinicName(dto.getClinicName());
            doctor.setWorkingOn(dto.getClinicName());
        }
        if (dto.getLanguages() != null) doctor.setLanguages(dto.getLanguages());
        if (dto.getBio() != null) doctor.setBio(dto.getBio());

        if (dto.getSpecialization() != null && !dto.getSpecialization().isBlank()) {
            Speciality speciality = specialityRepository.findByNameIgnoreCase(dto.getSpecialization())
                    .orElseGet(() -> specialityRepository.save(Speciality.builder()
                            .name(dto.getSpecialization())
                            .imageUrl("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80")
                            .build()));
            doctor.setSpeciality(speciality);
        }

        DoctorProfile updated = doctorProfileRepository.save(doctor);
        return mapToDto(updated);
    }

    @Transactional
    public DoctorDto uploadProfileImage(Long userId, MultipartFile file) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + userId));

        String imageUrl = fileUploadService.uploadImage(file);
        User user = doctor.getUser();
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);

        return mapToDto(doctor);
    }

    @Transactional
    public DoctorDto updateAvailability(Long userId, AvailabilityUpdateRequest request) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + userId));

        doctor.setIsAvailable(request.getIsAvailable());
        DoctorProfile updated = doctorProfileRepository.save(doctor);
        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateYearlyEarnings(Long userId) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + userId));

        int currentYear = LocalDate.now().getYear();
        return appointmentRepository.calculateTotalEarningsForDoctorInYear(doctor.getId(), currentYear);
    }

    @Transactional(readOnly = true)
    public List<DoctorPatientDto> getDoctorPatients(Long userId) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for User ID: " + userId));

        List<User> patients = appointmentRepository.findDistinctPatientsByDoctorId(doctor.getId());
        List<DoctorPatientDto> result = new ArrayList<>();

        for (User patient : patients) {
            List<Appointment> appts = appointmentRepository.findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(patient.getId());
            List<Appointment> doctorAppts = appts.stream()
                    .filter(a -> a.getDoctor().getId().equals(doctor.getId()))
                    .collect(Collectors.toList());

            long count = doctorAppts.size();
            LocalDate lastDate = doctorAppts.isEmpty() ? null : doctorAppts.get(0).getAppointmentDate();
            String lastStatus = doctorAppts.isEmpty() ? null : doctorAppts.get(0).getStatus().name();

            PatientProfile profile = patientProfileRepository.findByUserId(patient.getId()).orElse(null);

            DoctorPatientDto dto = DoctorPatientDto.builder()
                    .patientId(patient.getId())
                    .name(patient.getName())
                    .email(patient.getEmail())
                    .mobileNumber(patient.getMobileNumber())
                    .age(patient.getAge())
                    .city(patient.getCity())
                    .bloodGroup(profile != null ? profile.getBloodGroup() : "Not Specified")
                    .medicalHistory(profile != null ? profile.getMedicalHistory() : "None Recorded")
                    .totalAppointments(count)
                    .lastAppointmentDate(lastDate)
                    .lastAppointmentStatus(lastStatus)
                    .build();

            result.add(dto);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<MedicalHistoryDto> getPatientMedicalHistoryForDoctor(Long doctorUserId, Long patientUserId) {
        DoctorProfile doctor = doctorProfileRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor Profile not found for user: " + doctorUserId));

        List<Appointment> doctorApptsWithPatient = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(doctor.getId()).stream()
                .filter(a -> a.getPatient().getId().equals(patientUserId))
                .collect(Collectors.toList());

        if (doctorApptsWithPatient.isEmpty()) {
            auditLogService.logEvent(doctorUserId, "ROLE_DOCTOR", "UNAUTHORIZED_ACCESS", "PATIENT_HISTORY", patientUserId.toString(), "Doctor attempted to access medical history of unrelated patient", null);
            throw new AccessDeniedException("You are not authorized to view medical history for a patient who has no appointments with you.");
        }

        auditLogService.logEvent(doctorUserId, "ROLE_DOCTOR", "MEDICAL_HISTORY_ACCESS", "PATIENT_HISTORY", patientUserId.toString(), "Doctor accessed medical history for patient ID " + patientUserId, null);

        return patientService.getMedicalHistoryForPatient(patientUserId);
    }

    public DoctorDto mapToDto(DoctorProfile entity) {
        if (entity == null) return null;
        User user = entity.getUser();

        String addressParts = StreamOfNotNull(user.getAddress(), user.getCity(), user.getState(), user.getCountry())
                .collect(Collectors.joining(", "));

        return DoctorDto.builder()
                .id(entity.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .age(user.getAge())
                .fullAddress(addressParts)
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "/images/doctor.png")
                .specialization(entity.getSpeciality() != null ? entity.getSpeciality().getName() : "General Medicine")
                .fees(entity.getFees())
                .experience(entity.getExperienceYears())
                .rating(entity.getRating())
                .reviewCount(reviewRepository.countByDoctorId(entity.getId()))
                .availability(entity.getIsAvailable())
                .workingOn(entity.getWorkingOn() != null ? entity.getWorkingOn() : entity.getClinicName())
                .degree(entity.getDegree())
                .licenseNumber(entity.getLicenseNumber())
                .clinicName(entity.getClinicName() != null ? entity.getClinicName() : entity.getWorkingOn())
                .languages(entity.getLanguages())
                .bio(entity.getBio())
                .build();
    }

    private java.util.stream.Stream<String> StreamOfNotNull(String... values) {
        return java.util.Arrays.stream(values).filter(v -> v != null && !v.isBlank());
    }
}
