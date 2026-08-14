package com.careconnect.controller;

import com.careconnect.dto.response.ApiResponse;
import com.careconnect.dto.response.PatientDto;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Patient Management", description = "Endpoints for Patient Profile Retrieval and Updates")
public class PatientController {

    private final PatientService patientService;

    @GetMapping({"/api/v1/patients/me", "/patient/profile/", "/patient/profile"})
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    @Operation(summary = "Get current patient profile details")
    public ResponseEntity<PatientDto> getPatientProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        PatientDto patient = patientService.getPatientProfileByUserId(userPrincipal.getId());
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/api/v1/patients/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update current patient profile details")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatientProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PatientDto dto) {
        PatientDto updated = patientService.updatePatientProfile(userPrincipal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Patient profile updated successfully", updated));
    }

    @GetMapping("/api/v1/patients/me/medical-history")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get current patient medical history and previous consultations")
    public ResponseEntity<ApiResponse<java.util.List<com.careconnect.dto.response.MedicalHistoryDto>>> getMedicalHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        java.util.List<com.careconnect.dto.response.MedicalHistoryDto> history = patientService.getMedicalHistoryForPatient(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient medical history retrieved successfully", history));
    }
}
