package com.careconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    private String email;
    private String password;
    private Integer age;
    private String address;
    private String city;
    private String state;
    private String country;
    private String userType; // "patient" or "doctor"

    // Doctor specific fields
    private String specialization;
    private Integer fees;
    private Integer experience;
    private String workingOn;
    private String degree;
    private String licenseNumber;
    private String clinicName;
    private String languages;
    private String bio;
    private String profilePictureUrl;
}
