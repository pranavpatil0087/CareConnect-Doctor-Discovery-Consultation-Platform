package com.careconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityUpdateRequest {

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;
}
