package com.careconnect.repository;

import com.careconnect.entity.DoctorProfile;
import com.careconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    Optional<DoctorProfile> findByUser(User user);
    Optional<DoctorProfile> findByUserId(Long userId);

    @Query("SELECT d FROM DoctorProfile d WHERE " +
           "(:specialityId IS NULL OR d.speciality.id = :specialityId) AND " +
           "(:speciality IS NULL OR LOWER(d.speciality.name) LIKE LOWER(CONCAT('%', CAST(:speciality AS string), '%'))) AND " +
           "(:city IS NULL OR LOWER(d.user.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) AND " +
           "(:name IS NULL OR LOWER(d.user.name) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%'))) AND " +
           "(:isAvailable IS NULL OR d.isAvailable = :isAvailable)")
    List<DoctorProfile> searchDoctors(
            @Param("specialityId") Integer specialityId,
            @Param("speciality") String speciality,
            @Param("city") String city,
            @Param("name") String name,
            @Param("isAvailable") Boolean isAvailable
    );
}
