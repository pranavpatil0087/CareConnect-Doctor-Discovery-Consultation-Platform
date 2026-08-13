package com.careconnect.controller;

import com.careconnect.dto.request.AppointmentCreateRequest;
import com.careconnect.dto.request.PrescriptionRequest;
import com.careconnect.dto.response.ApiResponse;
import com.careconnect.dto.response.AppointmentDto;
import com.careconnect.dto.response.PrescriptionDto;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment Management", description = "Endpoints for Slot Booking, History, Status Updates, and Prescriptions")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book a new appointment with a doctor")
    public ResponseEntity<ApiResponse<AppointmentDto>> createAppointment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AppointmentCreateRequest request) {
        AppointmentDto appointment = appointmentService.createAppointment(userPrincipal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Appointment booked successfully!", appointment), HttpStatus.CREATED);
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get list of appointments for current patient")
    public ResponseEntity<List<AppointmentDto>> getPatientAppointments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsForPatient(userPrincipal.getId());
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get list of appointments scheduled for current doctor")
    public ResponseEntity<List<AppointmentDto>> getDoctorAppointments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsForDoctor(userPrincipal.getId());
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get appointment details by unique Booking ID")
    public ResponseEntity<AppointmentDto> getAppointmentByBookingId(@PathVariable String bookingId) {
        AppointmentDto appointment = appointmentService.getAppointmentByBookingId(bookingId);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{appointmentId}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update appointment status (BOOKED, COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        AppointmentDto updated = appointmentService.updateAppointmentStatus(appointmentId, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, updated));
    }

    @PostMapping("/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Issue digital prescription for an appointment")
    public ResponseEntity<ApiResponse<PrescriptionDto>> addPrescription(
            @Valid @RequestBody PrescriptionRequest request) {
        PrescriptionDto prescription = appointmentService.addPrescription(request);
        return ResponseEntity.ok(ApiResponse.success("Prescription issued successfully!", prescription));
    }
}
