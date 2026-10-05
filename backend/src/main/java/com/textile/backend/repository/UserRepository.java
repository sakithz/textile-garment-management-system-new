package com.textile.backend.repository;

import com.textile.backend.entity.User;
import com.textile.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByUserCode(String userCode);

    boolean existsByUserCode(String userCode);

    List<User> findByRole(UserRole role);

    Optional<User> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeId(Long employeeId);

    boolean existsByRole(UserRole role);
}