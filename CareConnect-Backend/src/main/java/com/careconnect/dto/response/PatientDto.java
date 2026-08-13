package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {
    private UUID id;
    private Long userId;
    private String name;
    private String email;
    private String mobileNumber;
    private Integer age;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profilePictureUrl;

    private String medicalHistory;
    private String bloodGroup;
}
