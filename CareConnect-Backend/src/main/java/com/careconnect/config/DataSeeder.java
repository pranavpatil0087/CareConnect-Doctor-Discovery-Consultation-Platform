package com.careconnect.config;

import com.careconnect.entity.Role;
import com.careconnect.entity.User;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.PatientProfile;
import com.careconnect.entity.Speciality;
import com.careconnect.repository.RoleRepository;
import com.careconnect.repository.UserRepository;
import com.careconnect.repository.DoctorProfileRepository;
import com.careconnect.repository.PatientProfileRepository;
import com.careconnect.repository.SpecialityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;

@Configuration
public class DataSeeder {

    @Bean
    @Transactional
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            RoleRepository roleRepository,
            DoctorProfileRepository doctorProfileRepository,
            PatientProfileRepository patientProfileRepository,
            SpecialityRepository specialityRepository,
            PasswordEncoder passwordEncoder) {
        
        return args -> {
            // Check if demo doctor already exists
            if (userRepository.findByEmail("doctor@demo.com").isEmpty()) {
                Role doctorRole = roleRepository.findByName("ROLE_DOCTOR")
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                
                User doctor = new User();
                doctor.setName("Dr. Sarah Jenkins");
                doctor.setEmail("doctor@demo.com");
                doctor.setMobileNumber("9999999999");
                doctor.setPassword(passwordEncoder.encode("demo123"));
                doctor.setProfilePictureUrl("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80");
                doctor.setIsActive(true);
                doctor.setIsVerified(true);
                doctor.setRoles(new HashSet<>(java.util.Collections.singletonList(doctorRole)));
                
                userRepository.save(doctor);
                
                Optional<Speciality> spec = specialityRepository.findByName("Cardiology");
                
                DoctorProfile docProfile = new DoctorProfile();
                docProfile.setUser(doctor);
                docProfile.setFees(500);
                docProfile.setExperienceYears(10);
                docProfile.setRating(4.9);
                docProfile.setIsAvailable(true);
                spec.ifPresent(docProfile::setSpeciality);
                
                doctorProfileRepository.save(docProfile);
                System.out.println("✅ Demo Doctor created: doctor@demo.com / demo123");
            }

            // Check if demo patient already exists
            if (userRepository.findByEmail("patient@demo.com").isEmpty()) {
                Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                
                User patient = new User();
                patient.setName("John Doe");
                patient.setEmail("patient@demo.com");
                patient.setMobileNumber("8888888888");
                patient.setPassword(passwordEncoder.encode("demo123"));
                patient.setIsActive(true);
                patient.setIsVerified(true);
                patient.setRoles(new HashSet<>(java.util.Collections.singletonList(patientRole)));
                
                userRepository.save(patient);
                
                PatientProfile patProfile = new PatientProfile();
                patProfile.setUser(patient);
                patProfile.setBloodGroup("O+");
                
                patientProfileRepository.save(patProfile);
                System.out.println("✅ Demo Patient created: patient@demo.com / demo123");
            }
        };
    }
}
