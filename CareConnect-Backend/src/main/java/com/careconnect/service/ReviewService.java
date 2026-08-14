package com.careconnect.service;

import com.careconnect.dto.request.ReviewRequestDto;
import com.careconnect.dto.response.ReviewResponseDto;
import com.careconnect.entity.Appointment;
import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.Review;
import com.careconnect.entity.enums.AppointmentStatus;
import com.careconnect.exception.ResourceNotFoundException;
import com.careconnect.repository.AppointmentRepository;
import com.careconnect.repository.DoctorProfileRepository;
import com.careconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Transactional
    public ReviewResponseDto createReview(Long patientUserId, ReviewRequestDto dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + dto.getAppointmentId()));

        if (!appointment.getPatient().getId().equals(patientUserId)) {
            throw new IllegalArgumentException("Patient is not associated with this appointment");
        }

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Reviews are allowed only after completed appointments");
        }

        if (reviewRepository.existsByAppointmentId(dto.getAppointmentId())) {
            throw new IllegalStateException("A review has already been submitted for this appointment");
        }

        DoctorProfile doctor = appointment.getDoctor();

        Review review = Review.builder()
                .appointment(appointment)
                .doctor(doctor)
                .patient(appointment.getPatient())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        // Recalculate Average Rating for Doctor
        Double avgRating = reviewRepository.findAverageRatingByDoctorId(doctor.getId());
        if (avgRating != null) {
            doctor.setRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
            doctorProfileRepository.save(doctor);
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getDoctorReviews(String doctorId) {
        UUID docUuid = UUID.fromString(doctorId);
        return reviewRepository.findByDoctorIdOrderByCreatedAtDesc(docUuid).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getMyReviews(Long patientUserId) {
        return reviewRepository.findByPatientIdOrderByCreatedAtDesc(patientUserId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReviewResponseDto mapToDto(Review entity) {
        return ReviewResponseDto.builder()
                .id(entity.getId())
                .appointmentId(entity.getAppointment().getId())
                .doctorId(entity.getDoctor().getId().toString())
                .doctorName(entity.getDoctor().getUser().getName())
                .patientId(entity.getPatient().getId())
                .patientName(entity.getPatient().getName())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
