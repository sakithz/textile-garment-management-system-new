package com.textile.backend.service;

import com.textile.backend.dto.PaymentRequest;
import com.textile.backend.entity.Invoice;
import com.textile.backend.entity.Payment;
import com.textile.backend.entity.PaymentStatus;
import com.textile.backend.repository.InvoiceRepository;
import com.textile.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository,
            InvoiceService invoiceService
    ) {
        this.paymentRepository =
                paymentRepository;

        this.invoiceRepository =
                invoiceRepository;

        this.invoiceService =
                invoiceService;
    }

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {

        return paymentRepository
                .findAll();
    }

    // =========================================================
    // GET PAYMENTS FOR INVOICE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payment>
    getPaymentsForInvoice(
            Long invoiceId
    ) {

        return paymentRepository
                .findByInvoiceIdOrderByPaymentDateDesc(
                        invoiceId
                );
    }

    // =========================================================
    // CUSTOMER SUBMITS PAYMENT
    // =========================================================

    public Payment submitCustomerPayment(
            Long invoiceId,
            PaymentRequest request,
            Long customerId
    ) {

        Invoice invoice =
                invoiceRepository
                        .findById(invoiceId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Invoice not found"
                                        )
                        );

        /*
         * Find all payments and determine how much has already
         * been verified.
         */
        double verifiedAmount =
                getVerifiedAmount(
                        invoiceId
                );

        double invoiceAmount =
                invoice.getAmount() != null
                        ? invoice.getAmount()
                        : 0.0;

        double balance =
                Math.max(
                        invoiceAmount -
                                verifiedAmount,
                        0.0
                );

        double requested =
                request.getAmountPaid() != null
                        ? request.getAmountPaid()
                        : 0.0;

        if (requested <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero."
            );
        }

        if (requested > balance) {

            throw new IllegalArgumentException(
                    "Payment amount cannot exceed the remaining balance of "
                            + balance
            );
        }

        /*
         * Customer ownership.
         *
         * The current project identifies the customer through
         * the Order -> Customer relationship.
         */
        if (
                invoice.getOrderId() == null
        ) {

            throw new IllegalArgumentException(
                    "Invoice is not linked to an order."
            );
        }

        /*
         * We do not accept customerId from the browser.
         * It comes from the authenticated customer token.
         *
         * The Order/Customer ownership can be validated by the
         * customer order API as well.
         */
        if (customerId == null) {

            throw new IllegalArgumentException(
                    "Customer authentication is required."
            );
        }

        Payment payment =
                new Payment();

        payment.setInvoice(
                invoice
        );

        payment.setAmountPaid(
                round(requested)
        );

        payment.setPaymentDate(
                request.getPaymentDate() != null
                        ? request.getPaymentDate()
                        : LocalDate.now()
        );

        payment.setPaymentMethod(
                request.getPaymentMethod()
        );

        payment.setReferenceNo(
                request.getReferenceNo() != null
                        ? request
                        .getReferenceNo()
                        .trim()
                        : null
        );

        payment.setStatus(
                PaymentStatus.PENDING
        );

        payment.setRecordedByUserId(
                null
        );

        return paymentRepository.save(
                payment
        );
    }

    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    public Payment verifyPayment(
            Long paymentId,
            Long userId
    ) {

        Payment payment =
                getPayment(paymentId);

        if (
                payment.getStatus() ==
                        PaymentStatus.VERIFIED
        ) {

            return payment;
        }

        if (
                payment.getStatus() ==
                        PaymentStatus.REJECTED
        ) {

            throw new IllegalArgumentException(
                    "Rejected payment cannot be verified."
            );
        }

        payment.setStatus(
                PaymentStatus.VERIFIED
        );

        payment.setRecordedByUserId(
                userId
        );

        Payment saved =
                paymentRepository.save(
                        payment
                );

        double verifiedAmount =
                getVerifiedAmount(
                        payment
                                .getInvoice()
                                .getId()
                );

        invoiceService
                .updateVerifiedPaymentAmount(
                        payment
                                .getInvoice()
                                .getId(),
                        verifiedAmount
                );

        return saved;
    }

    // =========================================================
    // REJECT PAYMENT
    // =========================================================

    public Payment rejectPayment(
            Long paymentId,
            String reason,
            Long userId
    ) {

        Payment payment =
                getPayment(paymentId);

        payment.setStatus(
                PaymentStatus.REJECTED
        );

        payment.setRejectionReason(
                reason != null
                        ? reason.trim()
                        : "Payment rejected"
        );

        payment.setRecordedByUserId(
                userId
        );

        return paymentRepository.save(
                payment
        );
    }

    // =========================================================
    // GET PAYMENT
    // =========================================================

    private Payment getPayment(
            Long paymentId
    ) {

        return paymentRepository
                .findById(paymentId)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Payment not found"
                                )
                );
    }

    // =========================================================
    // VERIFIED TOTAL
    // =========================================================

    private double getVerifiedAmount(
            Long invoiceId
    ) {

        return paymentRepository
                .findByInvoiceIdOrderByPaymentDateDesc(
                        invoiceId
                )
                .stream()
                .filter(
                        payment ->
                                payment.getStatus()
                                        ==
                                        PaymentStatus.VERIFIED
                )
                .mapToDouble(
                        payment ->
                                payment.getAmountPaid() != null
                                        ? payment.getAmountPaid()
                                        : 0.0
                )
                .sum();
    }

    private double round(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}