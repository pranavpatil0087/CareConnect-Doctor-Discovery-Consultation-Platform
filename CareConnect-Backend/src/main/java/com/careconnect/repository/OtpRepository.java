package com.careconnect.repository;

import com.careconnect.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByContactAndCodeAndIsVerifiedFalseOrderByCreatedAtDesc(String contact, String code);
    Optional<Otp> findTopByContactAndIsVerifiedFalseOrderByCreatedAtDesc(String contact);
}
