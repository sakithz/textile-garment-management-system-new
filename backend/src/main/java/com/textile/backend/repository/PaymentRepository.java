package com.textile.backend.repository;

import com.textile.backend.entity.Payment;
import com.textile.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    List<Payment>
    findByInvoiceIdOrderByPaymentDateDesc(
            Long invoiceId
    );

    List<Payment>
    findByStatusOrderByPaymentDateDesc(
            PaymentStatus status
    );
}