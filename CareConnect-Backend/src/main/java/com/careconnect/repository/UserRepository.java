package com.careconnect.repository;

import com.careconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByEmail(String email);
    Optional<User> findByMobileNumberOrEmail(String mobileNumber, String email);
    Boolean existsByMobileNumber(String mobileNumber);
    Boolean existsByEmail(String email);
}
