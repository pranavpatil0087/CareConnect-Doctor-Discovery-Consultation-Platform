package com.careconnect.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistoryDto {
    private Long appointmentId;
    private String bookingId;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String status;
    private String consultationMedium;

    // Doctor info
    private String doctorId;
    private String doctorName;
    private String specialization;
    private String clinicName;

    // Patient info
    private Long patientId;
    private String patientName;

    // Prescription info
    private Boolean prescriptionAvailable;
    private Long prescriptionId;
    private String doctorNotes;
    private String medicines;
    private ZonedDateTime prescriptionCreatedAt;
}
