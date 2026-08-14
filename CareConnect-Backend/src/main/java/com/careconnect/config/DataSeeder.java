package com.careconnect.config;

import com.careconnect.entity.Role;
import com.careconnect.entity.User;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.PatientProfile;
import com.careconnect.entity.Speciality;
import com.careconnect.entity.enums.RoleName;
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

import java.math.BigDecimal;
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
            for (RoleName roleName : RoleName.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    roleRepository.save(new Role(null, roleName));
                }
            }

            Role doctorRole = roleRepository.findByName(RoleName.ROLE_DOCTOR)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

            // Check if admin user already exists
            if (userRepository.findByEmail("admin@careconnect.com").isEmpty()) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@careconnect.com");
                admin.setMobileNumber("9000000000");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setIsActive(true);
                admin.setIsVerified(true);
                admin.setRoles(new HashSet<>(java.util.Collections.singletonList(adminRole)));
                userRepository.save(admin);
                System.out.println("✅ Default Admin created: admin@careconnect.com / admin123");
            }

            // 1. Dr. Sarah Jenkins (Demo Primary Doctor)
            seedDoctor(userRepository, doctorProfileRepository, specialityRepository, passwordEncoder, doctorRole,
                    "Dr. Sarah Jenkins", "doctor@demo.com", "9999999999", "demo123",
                    "MBBS, MD (Cardiology)", "MCI-10293", "Fleming Heart Center", "Mumbai", "Cardiology",
                    12, 800, new BigDecimal("4.9"), "English, Hindi",
                    "Senior Cardiologist specializing in preventive heart health and non-invasive procedures.",
                    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80");

            // 2. Dr. Ananya Sharma
            seedDoctor(userRepository, doctorProfileRepository, specialityRepository, passwordEncoder, doctorRole,
                    "Dr. Ananya Sharma", "ananya.sharma@careconnect.com", "9876543210", "demo123",
                    "MBBS, MD (Dermatology)", "MCI-44512", "Aesthetics & Skin Care Clinic", "Delhi", "Dermatology",
                    9, 600, new BigDecimal("4.8"), "English, Hindi, Punjabi",
                    "Expert Dermatologist focusing on clinical dermatology, laser therapy, and skin rejuvenation.",
                    "https://images.unsplash.com/photo-1594824813566-88855ce78341?auto=format&fit=crop&w=300&q=80");

            // 3. Dr. Rahul Mehta
            seedDoctor(userRepository, doctorProfileRepository, specialityRepository, passwordEncoder, doctorRole,
                    "Dr. Rahul Mehta", "rahul.mehta@careconnect.com", "9876543211", "demo123",
                    "MBBS, MS (Orthopedics)", "MCI-88123", "Joint Care & Spine Institute", "Bangalore", "Orthopedics",
                    14, 1000, new BigDecimal("4.95"), "English, Kannada, Hindi",
                    "Lead Orthopedic Surgeon with extensive expertise in joint replacement and sports injuries.",
                    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80");

            // 4. Dr. Priya Nair
            seedDoctor(userRepository, doctorProfileRepository, specialityRepository, passwordEncoder, doctorRole,
                    "Dr. Priya Nair", "priya.nair@careconnect.com", "9876543212", "demo123",
                    "MBBS, DCH, MD (Pediatrics)", "MCI-77341", "Sunshine Child Care Clinic", "Chennai", "Pediatrics",
                    8, 500, new BigDecimal("4.85"), "English, Tamil, Malayalam",
                    "Compassionate Pediatrician dedicated to newborn care, child development, and vaccinations.",
                    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=300&q=80");

            // 5. Dr. Arjun Kapoor
            seedDoctor(userRepository, doctorProfileRepository, specialityRepository, passwordEncoder, doctorRole,
                    "Dr. Arjun Kapoor", "arjun.kapoor@careconnect.com", "9876543213", "demo123",
                    "MBBS, DM (Neurology)", "MCI-99541", "Brain & Spine Super Speciality", "Hyderabad", "Neurology",
                    15, 1200, new BigDecimal("4.98"), "English, Telugu, Hindi",
                    "Consultant Neurologist specializing in stroke management, epilepsy, and migraine treatment.",
                    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80");

            // 6. Dr. Neha Verma
            seedDoctor(userRepository, doctorProfileRepository, specialityRepository, passwordEncoder, doctorRole,
                    "Dr. Neha Verma", "neha.verma@careconnect.com", "9876543214", "demo123",
                    "MBBS, DNB (General Medicine)", "MCI-33120", "CareConnect Wellness Hub", "Pune", "General Medicine",
                    10, 400, new BigDecimal("4.75"), "English, Marathi, Hindi",
                    "General Physician with comprehensive expertise in primary health care, diabetes, and hypertension.",
                    "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=300&q=80");

            // Check if demo patient already exists
            if (userRepository.findByEmail("patient@demo.com").isEmpty()) {
                Role patientRole = roleRepository.findByName(RoleName.ROLE_PATIENT)
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

    private void seedDoctor(UserRepository userRepository, DoctorProfileRepository doctorProfileRepository,
                            SpecialityRepository specialityRepository, PasswordEncoder passwordEncoder, Role doctorRole,
                            String name, String email, String mobile, String password,
                            String degree, String licenseNumber, String clinicName, String city, String specialityName,
                            int expYears, int fees, BigDecimal rating, String languages, String bio, String imgUrl) {
        if (userRepository.findByEmail(email).isEmpty() && userRepository.findByMobileNumber(mobile).isEmpty()) {
            User doctor = new User();
            doctor.setName(name);
            doctor.setEmail(email);
            doctor.setMobileNumber(mobile);
            doctor.setPassword(passwordEncoder.encode(password));
            doctor.setProfilePictureUrl(imgUrl);
            doctor.setCity(city);
            doctor.setIsActive(true);
            doctor.setIsVerified(true);
            doctor.setRoles(new HashSet<>(java.util.Collections.singletonList(doctorRole)));
            userRepository.save(doctor);

            DoctorProfile docProfile = new DoctorProfile();
            docProfile.setUser(doctor);
            docProfile.setDegree(degree);
            docProfile.setLicenseNumber(licenseNumber);
            docProfile.setClinicName(clinicName);
            docProfile.setFees(fees);
            docProfile.setExperienceYears(expYears);
            docProfile.setRating(rating);
            docProfile.setLanguages(languages);
            docProfile.setBio(bio);
            docProfile.setWorkingOn(clinicName);
            docProfile.setIsAvailable(true);

            specialityRepository.findByNameIgnoreCase(specialityName).ifPresent(docProfile::setSpeciality);
            doctorProfileRepository.save(docProfile);
            System.out.println("✅ Demo Doctor created: " + name + " (" + email + ")");
        }
    }
}

