package com.careconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {

    @NotBlank(message = "Contact is required")
    private String contact;

    @NotBlank(message = "OTP code is required")
    private String code;
}
