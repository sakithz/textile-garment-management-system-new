package com.textile.backend.controller;

import com.textile.backend.dto.PaymentRequest;
import com.textile.backend.entity.Payment;
import com.textile.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService =
                paymentService;
    }

    // =========================================================
    // INTERNAL - ALL PAYMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Payment>>
    getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    // =========================================================
    // CUSTOMER / INTERNAL - INVOICE PAYMENTS
    // =========================================================

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<Payment>>
    getInvoicePayments(
            @PathVariable Long invoiceId
    ) {

        return ResponseEntity.ok(
                paymentService
                        .getPaymentsForInvoice(
                                invoiceId
                        )
        );
    }

    // =========================================================
    // CUSTOMER - SUBMIT PAYMENT
    // =========================================================

    @PostMapping("/customer/{invoiceId}")
    public ResponseEntity<Payment>
    submitCustomerPayment(
            @PathVariable Long invoiceId,
            @Valid
            @RequestBody
            PaymentRequest request,
            Authentication authentication
    ) {

        Long customerId =
                Long.parseLong(
                        authentication.getName()
                );

        Payment payment =
                paymentService
                        .submitCustomerPayment(
                                invoiceId,
                                request,
                                customerId
                        );

        return new ResponseEntity<>(
                payment,
                HttpStatus.CREATED
        );
    }

    // =========================================================
    // INTERNAL - VERIFY
    // =========================================================

    @PostMapping("/{paymentId}/verify")
    public ResponseEntity<Payment>
    verifyPayment(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                paymentService
                        .verifyPayment(
                                paymentId,
                                userId
                        )
        );
    }

    // =========================================================
    // INTERNAL - REJECT
    // =========================================================

    @PostMapping("/{paymentId}/reject")
    public ResponseEntity<Payment>
    rejectPayment(
            @PathVariable Long paymentId,
            @RequestBody
            Map<String, String> body,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(
                        authentication.getName()
                );

        String reason =
                body != null
                        ? body.get("reason")
                        : null;

        return ResponseEntity.ok(
                paymentService.rejectPayment(
                        paymentId,
                        reason,
                        userId
                )
        );
    }
}