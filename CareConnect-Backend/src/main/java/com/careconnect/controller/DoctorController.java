package com.careconnect.controller;

import com.careconnect.dto.request.AvailabilityUpdateRequest;
import com.careconnect.dto.response.ApiResponse;
import com.careconnect.dto.response.DoctorDto;
import com.careconnect.dto.response.DoctorPatientDto;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.DoctorService;
import com.careconnect.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Doctor Management", description = "Endpoints for Doctor Profile, Availability, Image Upload, Patient Database, and Doctor Search")
public class DoctorController {

    private final DoctorService doctorService;
    private final FileUploadService fileUploadService;

    @GetMapping({"/api/v1/doctors/me", "/doctor/home/"})
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get current authenticated doctor's profile")
    public ResponseEntity<DoctorDto> getDoctorHomeProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        DoctorDto doctor = doctorService.getDoctorProfileByUserId(userPrincipal.getId());
        return ResponseEntity.ok(doctor);
    }

    @PutMapping("/api/v1/doctors/me")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update current doctor's profile details")
    public ResponseEntity<ApiResponse<DoctorDto>> updateDoctorProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody DoctorDto dto) {
        DoctorDto updated = doctorService.updateDoctorProfile(userPrincipal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping("/api/v1/doctors/me/profile-image")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Upload profile picture for logged in doctor")
    public ResponseEntity<ApiResponse<DoctorDto>> uploadDoctorProfileImage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("file") MultipartFile file) {
        DoctorDto updated = doctorService.uploadProfileImage(userPrincipal.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded successfully", updated));
    }

    @PostMapping("/api/v1/doctors/upload-image")
    @Operation(summary = "Public image upload for doctor registration preview")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImageForRegistration(
            @RequestParam("file") MultipartFile file) {
        String url = fileUploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of("url", url)));
    }

    @PatchMapping("/api/v1/doctors/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Toggle doctor availability status")
    public ResponseEntity<ApiResponse<DoctorDto>> updateAvailability(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AvailabilityUpdateRequest request) {
        DoctorDto updated = doctorService.updateAvailability(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", updated));
    }

    @GetMapping("/api/v1/doctors/me/earnings")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get total yearly earnings collected by doctor")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getYearlyEarnings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        BigDecimal earnings = doctorService.calculateYearlyEarnings(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("amountCollected", earnings)));
    }

    @GetMapping("/api/v1/doctors/me/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get list of patients associated with authenticated doctor")
    public ResponseEntity<ApiResponse<List<DoctorPatientDto>>> getDoctorPatients(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DoctorPatientDto> patients = doctorService.getDoctorPatients(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", patients));
    }

    @GetMapping("/api/v1/doctors/me/patients/{patientUserId}/medical-history")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get medical history for a patient associated with current doctor")
    public ResponseEntity<ApiResponse<List<com.careconnect.dto.response.MedicalHistoryDto>>> getPatientMedicalHistoryForDoctor(
            @PathVariable Long patientUserId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<com.careconnect.dto.response.MedicalHistoryDto> history = doctorService.getPatientMedicalHistoryForDoctor(userPrincipal.getId(), patientUserId);
        return ResponseEntity.ok(ApiResponse.success("Patient medical history retrieved successfully", history));
    }

    @GetMapping("/api/v1/doctors/search")
    @Operation(summary = "Search & Filter Doctors by Speciality, City, Name, or Availability")
    public ResponseEntity<List<DoctorDto>> searchDoctors(
            @RequestParam(required = false) Integer specialityId,
            @RequestParam(required = false) String speciality,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isAvailable) {
        List<DoctorDto> doctors = doctorService.searchDoctors(specialityId, speciality, city, name, isAvailable);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/api/v1/doctors/{doctorId}")
    @Operation(summary = "Get doctor details by Doctor UUID")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable UUID doctorId) {
        DoctorDto doctor = doctorService.getDoctorProfileById(doctorId);
        return ResponseEntity.ok(doctor);
    }
}
