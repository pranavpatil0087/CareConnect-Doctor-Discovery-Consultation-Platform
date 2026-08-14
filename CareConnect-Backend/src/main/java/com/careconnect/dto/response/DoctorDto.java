package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {
    private UUID id;
    private Long userId;
    private String name;
    private String email;
    private String mobileNumber;
    private Integer age;
    private String fullAddress;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profilePictureUrl;

    private String specialization;
    private Integer fees;
    private Integer experience;
    private BigDecimal rating;
    private Long reviewCount;
    private Boolean availability;
    private String workingOn;

    private String degree;
    private String licenseNumber;
    private String clinicName;
    private String languages;
    private String bio;
}
