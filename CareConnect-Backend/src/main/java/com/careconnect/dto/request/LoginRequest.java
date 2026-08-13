package com.careconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Contact (Mobile number or Email) is required")
    private String contact;

    @NotBlank(message = "Password is required")
    private String password;
}
