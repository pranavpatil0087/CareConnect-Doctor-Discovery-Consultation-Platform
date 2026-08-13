package com.careconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {
    private Boolean success;
    private Integer status;
    private String error;
    private String message;
    private String path;
    private ZonedDateTime timestamp;
    private Map<String, String> validationErrors;
}
