package com.textile.backend.repository;

import com.textile.backend.entity.Quotation;
import com.textile.backend.entity.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository
        extends JpaRepository<Quotation, Long> {

    // =========================
    // FIND BY QUOTATION NUMBER
    // =========================

    Optional<Quotation> findByQuotationNumber(
            String quotationNumber
    );

    // =========================
    // CHECK QUOTATION NUMBER
    // =========================

    boolean existsByQuotationNumber(
            String quotationNumber
    );

    // =========================
    // CUSTOMER QUOTATIONS
    // =========================

    List<Quotation> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // =========================
    // FIND BY CUSTOMER
    // =========================

    List<Quotation> findByCustomerOrderByCreatedAtDesc(
            com.textile.backend.entity.Customer customer
    );

    // =========================
    // FIND BY STATUS
    // =========================

    List<Quotation> findByStatusOrderByCreatedAtDesc(
            QuotationStatus status
    );

    // =========================
    // FIND ALL - NEWEST FIRST
    // =========================

    List<Quotation> findAllByOrderByCreatedAtDesc();

    // =========================
    // CUSTOMER + STATUS
    // =========================

    List<Quotation> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            QuotationStatus status
    );

    // =========================
    // SEARCH QUOTATIONS
    // =========================

    @Query("SELECT q FROM Quotation q " +
            "WHERE LOWER(q.quotationNumber) " +
            "LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(q.garmentType) " +
            "LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(q.customer.name) " +
            "LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(q.customer.company) " +
            "LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(q.customer.email) " +
            "LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Quotation> searchQuotations(
            @Param("query") String query
    );
}