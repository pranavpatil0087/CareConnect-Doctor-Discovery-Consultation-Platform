package com.careconnect.service;

import com.careconnect.dto.response.PatientDto;
import com.careconnect.entity.PatientProfile;
import com.careconnect.entity.User;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.PatientProfileRepository;
import com.careconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;

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
