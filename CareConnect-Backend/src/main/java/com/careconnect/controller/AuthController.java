package com.careconnect.controller;

import com.careconnect.dto.request.*;
import com.careconnect.dto.response.ApiResponse;
import com.careconnect.dto.response.JwtAuthResponse;
import com.careconnect.service.AuthService;
import com.careconnect.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for Login, Registration, OTP, and Google Auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping({"/api/v1/auth/login", "/api/auth/token/"})
    @Operation(summary = "User Login with Mobile/Email and Password")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtAuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/api/v1/auth/register", "/accounts/register/", "/api/auth/register-user/"})
    @Operation(summary = "Register Patient or Doctor")
    public ResponseEntity<JwtAuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        JwtAuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping({"/api/v1/auth/otp/send", "/otp/send/"})
    @Operation(summary = "Send OTP code via SMS or Email")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendOtp(@Valid @RequestBody OtpSendRequest request) {
        String code = otpService.sendOtp(request.getContact(), request.getMethod());
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully via " + (request.getMethod() != null ? request.getMethod() : "sms"), Map.of("contact", request.getContact(), "code", code)));
    }

    @PostMapping({"/api/v1/auth/otp/verify", "/api/auth/otp-login/", "/otp/verify-otp/"})
    @Operation(summary = "Verify OTP code and authenticate")
    public ResponseEntity<JwtAuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        JwtAuthResponse response = authService.otpLogin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/api/v1/auth/google-login", "/api/auth/google-login/"})
    @Operation(summary = "Google OAuth2 ID Token Verification & Login")
    public ResponseEntity<JwtAuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        JwtAuthResponse response = authService.googleLogin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/api/v1/auth/logout", "/api/auth/logout/"})
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "Session ended"));
    }
}
