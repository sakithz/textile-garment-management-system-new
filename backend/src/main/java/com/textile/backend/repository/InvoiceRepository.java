package com.textile.backend.repository;

import com.textile.backend.entity.Invoice;
import com.textile.backend.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    Optional<Invoice>
    findByInvoiceNumber(
            String invoiceNumber
    );

    boolean existsByInvoiceNumber(
            String invoiceNumber
    );

    boolean existsByOrderId(
            String orderId
    );

    Optional<Invoice>
    findFirstByOrderId(
            String orderId
    );

    List<Invoice>
    findByStatus(
            InvoiceStatus status
    );

    List<Invoice>
    findByOrderId(
            String orderId
    );

    List<Invoice>
    findByCustomerContainingIgnoreCase(
            String customer
    );

    @Query(
            "SELECT i FROM Invoice i WHERE " +
                    "LOWER(i.invoiceNumber) LIKE " +
                    "LOWER(CONCAT('%', :query, '%')) OR " +
                    "LOWER(i.orderId) LIKE " +
                    "LOWER(CONCAT('%', :query, '%')) OR " +
                    "LOWER(i.customer) LIKE " +
                    "LOWER(CONCAT('%', :query, '%')) OR " +
                    "LOWER(COALESCE(i.campaignName, '')) LIKE " +
                    "LOWER(CONCAT('%', :query, '%'))"
    )
    List<Invoice> searchInvoices(
            @Param("query") String query
    );
}