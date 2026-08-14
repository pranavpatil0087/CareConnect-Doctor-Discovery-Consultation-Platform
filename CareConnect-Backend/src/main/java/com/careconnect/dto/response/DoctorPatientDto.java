package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPatientDto {
    private Long patientId;
    private String name;
    private String email;
    private String mobileNumber;
    private Integer age;
    private String gender;
    private String city;
    private String bloodGroup;
    private String medicalHistory;
    private Long totalAppointments;
    private LocalDate lastAppointmentDate;
    private String lastAppointmentStatus;
}
