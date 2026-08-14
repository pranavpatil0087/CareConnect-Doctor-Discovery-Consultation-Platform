package com.careconnect.dto.response;

import lombok.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminDto {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private String role;
    private Boolean isActive;
    private Boolean isVerified;
    private String city;
    private ZonedDateTime createdAt;
}
