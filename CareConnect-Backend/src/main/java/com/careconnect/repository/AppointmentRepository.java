package com.careconnect.repository;

import com.careconnect.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByBookingId(String bookingId);
    List<Appointment> findByPatientIdOrderByAppointmentDateDescTimeSlotDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(UUID doctorId);

    Boolean existsByDoctorIdAndAppointmentDateAndTimeSlot(UUID doctorId, LocalDate appointmentDate, String timeSlot);

    @Query("SELECT COALESCE(SUM(a.amountPaid), 0) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = 'COMPLETED' AND EXTRACT(YEAR FROM a.appointmentDate) = :year")
    BigDecimal calculateTotalEarningsForDoctorInYear(@Param("doctorId") UUID doctorId, @Param("year") int year);
}
