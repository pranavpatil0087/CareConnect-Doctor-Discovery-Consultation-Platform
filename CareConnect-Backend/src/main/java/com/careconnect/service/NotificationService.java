package com.careconnect.service;

import com.careconnect.dto.response.NotificationDto;
import com.careconnect.entity.Appointment;
import com.careconnect.entity.Notification;
import com.careconnect.entity.User;
import com.careconnect.entity.enums.AppointmentStatus;
import com.careconnect.entity.enums.NotificationType;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.NotificationRepository;
import com.careconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public NotificationDto createNotification(Long userId, NotificationType type, String message, Long appointmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .isRead(false)
                .appointmentId(appointmentId)
                .build();

        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to user");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !n.getIsRead())
                .collect(Collectors.toList());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Scheduled(cron = "0 0 * * * *") // Run hourly
    @Transactional
    public void sendUpcomingAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> upcomingAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getAppointmentDate() != null && a.getAppointmentDate().equals(tomorrow))
                .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
                .collect(Collectors.toList());

        for (Appointment appt : upcomingAppointments) {
            // Patient reminder
            boolean patientReminded = notificationRepository.existsByUserIdAndAppointmentIdAndType(
                    appt.getPatient().getId(), appt.getId(), NotificationType.REMINDER);
            if (!patientReminded) {
                createNotification(
                        appt.getPatient().getId(),
                        NotificationType.REMINDER,
                        "Reminder: You have an upcoming consultation with Dr. " + appt.getDoctor().getUser().getName() + " tomorrow at " + appt.getTimeSlot() + ".",
                        appt.getId()
                );
            }

            // Doctor reminder
            boolean doctorReminded = notificationRepository.existsByUserIdAndAppointmentIdAndType(
                    appt.getDoctor().getUser().getId(), appt.getId(), NotificationType.REMINDER);
            if (!doctorReminded) {
                createNotification(
                        appt.getDoctor().getUser().getId(),
                        NotificationType.REMINDER,
                        "Reminder: You have a scheduled consultation with " + appt.getPatient().getName() + " tomorrow at " + appt.getTimeSlot() + ".",
                        appt.getId()
                );
            }
        }
    }

    private NotificationDto mapToDto(Notification entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .type(entity.getType())
                .message(entity.getMessage())
                .isRead(entity.getIsRead())
                .appointmentId(entity.getAppointmentId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
