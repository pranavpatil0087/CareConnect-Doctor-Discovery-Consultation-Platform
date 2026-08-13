package com.careconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PrescriptionRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String doctorNotes;
    private String medicines;
}
