package com.textile.backend.repository;

import com.textile.backend.entity.Customer;
import com.textile.backend.entity.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerCode(String customerCode);

    Optional<Customer> findByEmail(String email);

    boolean existsByCustomerCode(String customerCode);

    boolean existsByEmail(String email);

    List<Customer> findByCompany(String company);

    List<Customer> findByStatus(CustomerStatus status);

    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.company) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("query") String query);
}