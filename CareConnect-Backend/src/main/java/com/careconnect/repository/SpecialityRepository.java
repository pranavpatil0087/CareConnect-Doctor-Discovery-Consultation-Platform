package com.careconnect.repository;

import com.careconnect.entity.Speciality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialityRepository extends JpaRepository<Speciality, Integer> {
    Optional<Speciality> findByNameIgnoreCase(String name);
}
