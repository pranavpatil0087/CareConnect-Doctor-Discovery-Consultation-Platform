package com.careconnect.service;

import com.careconnect.dto.request.AvailabilityUpdateRequest;
import com.careconnect.dto.response.DoctorDto;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.Speciality;
import com.careconnect.entity.User;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.DoctorProfileRepository;
import com.careconnect.repository.SpecialityRepository;
import com.careconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        userRepository.save(user);

        if (dto.getFees() != null) doctor.setFees(dto.getFees());
        if (dto.getExperience() != null) doctor.setExperienceYears(dto.getExperience());
        if (dto.getAvailability() != null) doctor.setIsAvailable(dto.getAvailability());
        if (dto.getWorkingOn() != null) doctor.setWorkingOn(dto.getWorkingOn());

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
                .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "images/doctor.png")
                .specialization(entity.getSpeciality() != null ? entity.getSpeciality().getName() : "General Medicine")
                .fees(entity.getFees())
                .experience(entity.getExperienceYears())
                .rating(entity.getRating())
                .availability(entity.getIsAvailable())
                .workingOn(entity.getWorkingOn())
                .build();
    }

    private java.util.stream.Stream<String> StreamOfNotNull(String... values) {
        return java.util.Arrays.stream(values).filter(v -> v != null && !v.isBlank());
    }
}
