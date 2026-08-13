package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private Integer age;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profilePictureUrl;
    private Boolean isActive;
    private Boolean isVerified;
    private Set<String> roles;
}
