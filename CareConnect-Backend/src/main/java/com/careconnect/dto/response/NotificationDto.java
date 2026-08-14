package com.careconnect.dto.response;

import com.careconnect.entity.enums.NotificationType;
import lombok.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String message;
    private Boolean isRead;
    private Long appointmentId;
    private ZonedDateTime createdAt;
}
