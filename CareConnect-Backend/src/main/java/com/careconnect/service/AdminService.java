package com.careconnect.service;

import com.careconnect.dto.response.AdminStatsDto;
import com.careconnect.dto.response.AppointmentDto;
import com.careconnect.dto.response.DoctorDto;
import com.careconnect.dto.response.UserAdminDto;
import com.careconnect.entity.Appointment;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.User;
import com.careconnect.entity.enums.AppointmentStatus;
import com.careconnect.entity.enums.RoleName;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.DoctorProfileRepository;
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
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public AdminStatsDto getDashboardStats() {
        long totalPatients = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_PATIENT))
                .count();

        long totalDoctors = doctorProfileRepository.count();

        long totalAppointments = appointmentRepository.count();

        long completedAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        long cancelledAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count();

        long pendingVerifications = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_DOCTOR))
                .filter(u -> !Boolean.TRUE.equals(u.getIsVerified()))
                .count();

        BigDecimal totalRevenue = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .map(Appointment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminStatsDto.builder()
                .totalPatients(totalPatients)
                .totalDoctors(totalDoctors)
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .pendingVerifications(pendingVerifications)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DoctorDto> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    @Transactional
    public DoctorDto verifyDoctor(String doctorProfileId, boolean isVerified) {
        DoctorProfile doctor = doctorProfileRepository.findById(UUID.fromString(doctorProfileId))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorProfileId));

        User user = doctor.getUser();
        user.setIsVerified(isVerified);
        userRepository.save(user);

        return doctorService.getDoctorProfileById(UUID.fromString(doctorProfileId));
    }

    @Transactional(readOnly = true)
    public List<UserAdminDto> getAllPatients() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_PATIENT))
                .map(this::mapUserToAdminDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserAdminDto toggleUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setIsActive(isActive);
        User saved = userRepository.save(user);
        return mapUserToAdminDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(appointmentService::mapToDto)
                .collect(Collectors.toList());
    }

    private UserAdminDto mapUserToAdminDto(User user) {
        String role = user.getRoles().stream()
                .map(r -> r.getName().name())
                .findFirst().orElse("ROLE_USER");

        return UserAdminDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(role)
                .isActive(user.getIsActive())
                .isVerified(user.getIsVerified())
                .city(user.getCity())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
