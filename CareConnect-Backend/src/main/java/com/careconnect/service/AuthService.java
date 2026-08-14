package com.careconnect.service;

import com.careconnect.dto.request.*;
import com.careconnect.dto.response.JwtAuthResponse;
import com.careconnect.entity.*;
import com.careconnect.entity.enums.RoleName;
import com.careconnect.exception.BadRequestException;
import com.careconnect.exception.ConflictException;
import com.careconnect.repository.*;
import com.careconnect.security.JwtTokenProvider;
import com.careconnect.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final SpecialityRepository specialityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final AuditLogService auditLogService;

    @Transactional
    public JwtAuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getContact(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        String userType = "patient";
        if (user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN)) {
            userType = "admin";
        } else if (user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_DOCTOR)) {
            userType = "doctor";
        }

        auditLogService.logEvent(user.getId(), "ROLE_" + userType.toUpperCase(), "USER_LOGIN", "USER", user.getId().toString(), "User logged in successfully via contact " + request.getContact(), null);

        return JwtAuthResponse.builder()
                .message("Login successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .userType(userType)
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .build();
    }

    @Transactional
    public JwtAuthResponse register(RegisterRequest request) {
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new ConflictException("Mobile number is already registered!");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email address is already registered!");
        }

        boolean isDoctor = "doctor".equalsIgnoreCase(request.getUserType());

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(isDoctor ? RoleName.ROLE_DOCTOR : RoleName.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(isDoctor ? RoleName.ROLE_DOCTOR : RoleName.ROLE_PATIENT).build()));
        roles.add(userRole);

        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword()
                : "CareConnect123!";

        User user = User.builder()
                .name(request.getName())
                .mobileNumber(request.getMobileNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .age(request.getAge())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .profilePictureUrl(request.getProfilePictureUrl())
                .roles(roles)
                .isVerified(true)
                .build();

        User savedUser = userRepository.save(user);

        if (isDoctor) {
            Speciality speciality = null;
            if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
                speciality = specialityRepository.findByNameIgnoreCase(request.getSpecialization())
                        .orElseGet(() -> specialityRepository.save(Speciality.builder()
                                .name(request.getSpecialization())
                                .imageUrl("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80")
                                .build()));
            }

            DoctorProfile doctorProfile = DoctorProfile.builder()
                    .user(savedUser)
                    .speciality(speciality)
                    .fees(request.getFees() != null ? request.getFees() : 500)
                    .experienceYears(request.getExperience() != null ? request.getExperience() : 2)
                    .workingOn(request.getWorkingOn() != null ? request.getWorkingOn() : (request.getClinicName() != null ? request.getClinicName() : "General Consultation"))
                    .degree(request.getDegree())
                    .licenseNumber(request.getLicenseNumber())
                    .clinicName(request.getClinicName() != null ? request.getClinicName() : request.getWorkingOn())
                    .languages(request.getLanguages())
                    .bio(request.getBio())
                    .isAvailable(true)
                    .build();

            doctorProfileRepository.save(doctorProfile);
        } else {
            PatientProfile patientProfile = PatientProfile.builder()
                    .user(savedUser)
                    .build();

            patientProfileRepository.save(patientProfile);
        }

        UserPrincipal principal = UserPrincipal.create(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        auditLogService.logEvent(savedUser.getId(), isDoctor ? "ROLE_DOCTOR" : "ROLE_PATIENT", "USER_REGISTER", "USER", savedUser.getId().toString(), "New user registered as " + (isDoctor ? "Doctor" : "Patient"), null);

        return JwtAuthResponse.builder()
                .message("User registered successfully")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .userType(isDoctor ? "doctor" : "patient")
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .mobileNumber(savedUser.getMobileNumber())
                .build();
    }

    @Transactional
    public JwtAuthResponse otpLogin(OtpVerifyRequest request) {
        otpService.verifyOtp(request.getContact(), request.getCode());

        Optional<User> userOptional = userRepository.findByMobileNumberOrEmail(request.getContact(), request.getContact());

        if (userOptional.isEmpty()) {
            throw new BadRequestException("User not registered. Please complete registration.");
        }

        User user = userOptional.get();
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        String userType = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ROLE_DOCTOR) ? "doctor" : "patient";

        return JwtAuthResponse.builder()
                .message("OTP verified successfully")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .userType(userType)
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .build();
    }

    @Transactional
    public JwtAuthResponse googleLogin(GoogleLoginRequest request) {
        // Mock / Parsed Google Login for transition
        String mockEmail = "user_" + Math.abs(request.getIdToken().hashCode() % 1000) + "@gmail.com";
        Optional<User> userOptional = userRepository.findByEmail(mockEmail);

        if (userOptional.isEmpty()) {
            throw new BadRequestException("Google user not registered in CareConnect");
        }

        User user = userOptional.get();
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        String userType = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ROLE_DOCTOR) ? "doctor" : "patient";

        return JwtAuthResponse.builder()
                .message("Google authentication successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .userType(userType)
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .build();
    }
}
