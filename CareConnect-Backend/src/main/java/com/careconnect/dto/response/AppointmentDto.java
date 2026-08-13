package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private String bookingId;
    private Long patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String status;
    private String consultationMedium;
    private String paymentMethod;
    private BigDecimal amountPaid;
    private ZonedDateTime createdAt;
    private PrescriptionDto prescription;
}
