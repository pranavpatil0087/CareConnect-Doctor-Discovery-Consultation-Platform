package com.careconnect.controller;

import com.careconnect.dto.request.ReviewRequestDto;
import com.careconnect.dto.response.ApiResponse;
import com.careconnect.dto.response.ReviewResponseDto;
import com.careconnect.security.UserPrincipal;
import com.careconnect.service.AuditLogService;
import com.careconnect.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AuditLogService auditLogService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> createReview(
            @Valid @RequestBody ReviewRequestDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        ReviewResponseDto response = reviewService.createReview(userPrincipal.getId(), dto);
        auditLogService.logEvent(userPrincipal.getId(), "ROLE_PATIENT", "REVIEW_CREATED", "DOCTOR", response.getDoctorId(), "Submitted rating: " + dto.getRating() + " stars", request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review submitted successfully", response));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDto>>> getDoctorReviews(@PathVariable String doctorId) {
        List<ReviewResponseDto> reviews = reviewService.getDoctorReviews(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor reviews retrieved", reviews));
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<ReviewResponseDto>>> getMyReviews(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ReviewResponseDto> reviews = reviewService.getMyReviews(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient reviews retrieved", reviews));
    }
}
