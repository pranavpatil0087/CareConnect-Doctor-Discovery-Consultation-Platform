package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponse {

    private String message;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String userType;
    private String name;
    private String email;
    private String mobileNumber;
}
