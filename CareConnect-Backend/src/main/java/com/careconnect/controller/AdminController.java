package com.careconnect.controller;

import com.careconnect.dto.response.*;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.AdminService;
import com.careconnect.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats(@AuthenticationPrincipal UserPrincipal userPrincipal, HttpServletRequest request) {
        auditLogService.logEvent(userPrincipal.getId(), "ROLE_ADMIN", "ADMIN_ACTION", "STATS", "GLOBAL", "Admin accessed dashboard statistics", request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard statistics retrieved", adminService.getDashboardStats()));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success("All doctors retrieved for admin", adminService.getAllDoctors()));
    }

    @PutMapping("/doctors/{id}/verify")
    public ResponseEntity<ApiResponse<DoctorDto>> verifyDoctor(
            @PathVariable String id,
            @RequestParam(defaultValue = "true") boolean isVerified,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        DoctorDto updated = adminService.verifyDoctor(id, isVerified);
        auditLogService.logEvent(userPrincipal.getId(), "ROLE_ADMIN", "DOCTOR_VERIFICATION", "DOCTOR", id, "Doctor verification status updated to " + isVerified, request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Doctor verification updated successfully", updated));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<List<UserAdminDto>>> getAllPatients() {
        return ResponseEntity.ok(ApiResponse.success("All patients retrieved for admin", adminService.getAllPatients()));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserAdminDto>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean isActive,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        UserAdminDto updated = adminService.toggleUserStatus(id, isActive);
        auditLogService.logEvent(userPrincipal.getId(), "ROLE_ADMIN", "ADMIN_ACTION", "USER", id.toString(), "User active status updated to " + isActive, request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success("All appointments retrieved for admin", adminService.getAllAppointments()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String userRole,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AuditLogDto> logs = auditLogService.getAuditLogs(actionType, userRole, search, page, size);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", logs));
    }
}
