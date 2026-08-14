package com.careconnect.dto.response;

import lombok.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private Long id;
    private Long userId;
    private String userRole;
    private String actionType;
    private String entityType;
    private String entityId;
    private String description;
    private String ipAddress;
    private ZonedDateTime createdAt;
}
