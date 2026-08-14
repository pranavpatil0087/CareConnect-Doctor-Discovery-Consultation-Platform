package com.careconnect.repository;

import com.careconnect.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(CAST(:actionType AS string) IS NULL OR LOWER(a.actionType) LIKE LOWER(CONCAT('%', CAST(:actionType AS string), '%'))) AND " +
           "(CAST(:userRole AS string) IS NULL OR LOWER(a.userRole) LIKE LOWER(CONCAT('%', CAST(:userRole AS string), '%'))) AND " +
           "(CAST(:search AS string) IS NULL OR LOWER(a.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(a.actionType) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<AuditLog> searchLogs(@Param("actionType") String actionType,
                              @Param("userRole") String userRole,
                              @Param("search") String search,
                              Pageable pageable);
}
