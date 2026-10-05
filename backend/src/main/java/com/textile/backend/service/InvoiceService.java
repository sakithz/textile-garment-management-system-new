package com.textile.backend.service;

import com.textile.backend.dto.InvoiceRequest;
import com.textile.backend.entity.Invoice;
import com.textile.backend.entity.InvoiceStatus;
import com.textile.backend.entity.Order;
import com.textile.backend.entity.OrderStatus;
import com.textile.backend.entity.Quotation;
import com.textile.backend.repository.InvoiceRepository;
import com.textile.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            OrderRepository orderRepository
    ) {
        this.invoiceRepository =
                invoiceRepository;

        this.orderRepository =
                orderRepository;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {

        return invoiceRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Invoice getInvoiceById(
            Long id
    ) {

        return invoiceRepository
                .findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invoice not found with id: " + id
                        )
                );
    }

    // =========================================================
    // GET BY ORDER
    // =========================================================

    @Transactional(readOnly = true)
    public Invoice getInvoiceByOrderId(
            String orderId
    ) {

        return invoiceRepository
                .findFirstByOrderId(orderId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Invoice not found for order: "
                                        + orderId
                        )
                );
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByStatus(
            InvoiceStatus status
    ) {

        return invoiceRepository
                .findByStatus(status);
    }

    // =========================================================
    // SEARCH
    // =========================================================

    @Transactional(readOnly = true)
    public List<Invoice> searchInvoices(
            String query
    ) {

        if (
                query == null ||
                        query.trim().isEmpty()
        ) {

            return getAllInvoices();
        }

        return invoiceRepository
                .searchInvoices(
                        query.trim()
                );
    }

    // =========================================================
    // CREATE INVOICE FROM ORDER
    // =========================================================

    public Invoice createInvoice(
            InvoiceRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Invoice request is required"
            );
        }

        String orderNumber =
                request.getOrderId()
                        .trim();

        if (
                invoiceRepository
                        .existsByOrderId(orderNumber)
        ) {

            throw new IllegalArgumentException(
                    "An invoice already exists for order "
                            + orderNumber
            );
        }

        Order order =
                orderRepository
                        .findByOrderNumber(
                                orderNumber
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Order not found: "
                                                        + orderNumber
                                        )
                        );

        if (
                order.getStatus() ==
                        OrderStatus.CANCELLED
        ) {

            throw new IllegalArgumentException(
                    "Cancelled orders cannot be invoiced."
            );
        }

        Invoice invoice =
                new Invoice();

        invoice.setInvoiceNumber(
                request.getOrderId() != null
                        ? generateInvoiceNumber()
                        : generateInvoiceNumber()
        );

        invoice.setOrderId(
                order.getOrderNumber()
        );

        if (order.getCustomer() != null) {

            invoice.setCustomer(
                    order.getCustomer()
                            .getName()
            );

        } else {

            invoice.setCustomer(
                    "Unknown Customer"
            );
        }

        /*
         * =====================================================
         * DISCOUNT SNAPSHOT
         * =====================================================
         *
         * Order.total is the final amount after quotation
         * discount.
         *
         * Quotation contains:
         *
         * baseUnitPrice
         * discountPercent
         * campaignName
         * totalPrice
         */

        Quotation quotation =
                order.getQuotation();

        double finalAmount =
                order.getTotal() != null
                        ? order.getTotal()
                        : 0.0;

        double baseAmount =
                finalAmount;

        double discountPercent =
                0.0;

        double discountAmount =
                0.0;

        String campaignName =
                null;

        if (quotation != null) {

            if (
                    quotation.getBaseUnitPrice() != null &&
                            order.getQuantity() != null
            ) {

                baseAmount =
                        quotation
                                .getBaseUnitPrice()
                                *
                                order.getQuantity();

            }

            if (
                    quotation.getDiscountPercent() != null
            ) {

                discountPercent =
                        quotation
                                .getDiscountPercent();
            }

            if (
                    quotation.getCampaignName() != null &&
                            !quotation
                                    .getCampaignName()
                                    .isBlank()
            ) {

                campaignName =
                        quotation
                                .getCampaignName();
            }

            /*
             * Prefer actual final order amount so that the
             * invoice always matches the Order.
             */
            discountAmount =
                    Math.max(
                            baseAmount -
                                    finalAmount,
                            0.0
                    );
        }

        /*
         * If quotation does not have a base amount but
         * contains a discount percentage, calculate it.
         */
        if (
                discountAmount <= 0 &&
                        discountPercent > 0 &&
                        baseAmount > 0
        ) {

            discountAmount =
                    baseAmount *
                            discountPercent /
                            100.0;

            finalAmount =
                    Math.max(
                            baseAmount -
                                    discountAmount,
                            0.0
                    );
        }

        /*
         * No quotation / no offer.
         */
        if (quotation == null) {

            baseAmount =
                    finalAmount;

            discountPercent =
                    0.0;

            discountAmount =
                    0.0;

            campaignName =
                    null;
        }

        invoice.setBaseAmount(
                round(baseAmount)
        );

        invoice.setDiscountPercent(
                round(discountPercent)
        );

        invoice.setDiscountAmount(
                round(discountAmount)
        );

        invoice.setCampaignName(
                campaignName
        );

        invoice.setAmount(
                round(finalAmount)
        );

        invoice.setAmountPaid(
                0.0
        );

        invoice.setDate(
                request.getDate() != null
                        ? request.getDate()
                        : LocalDate.now()
        );

        invoice.setDueDate(
                request.getDueDate() != null
                        ? request.getDueDate()
                        : invoice.getDate()
                        .plusDays(30)
        );

        invoice.setStatus(
                InvoiceStatus.PENDING
        );

        return invoiceRepository.save(
                invoice
        );
    }

    // =========================================================
    // UPDATE INVOICE DATES
    // =========================================================

    public Invoice updateInvoiceDates(
            Long id,
            InvoiceRequest request
    ) {

        Invoice invoice =
                getInvoiceById(id);

        if (request.getDate() != null) {

            invoice.setDate(
                    request.getDate()
            );
        }

        if (request.getDueDate() != null) {

            invoice.setDueDate(
                    request.getDueDate()
            );
        }

        return invoiceRepository.save(
                invoice
        );
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public Invoice updateStatus(
            Long id,
            InvoiceStatus status
    ) {

        Invoice invoice =
                getInvoiceById(id);

        invoice.setStatus(status);

        return invoiceRepository.save(
                invoice
        );
    }

    // =========================================================
    // UPDATE PAYMENT TOTAL
    // =========================================================

    public Invoice updateVerifiedPaymentAmount(
            Long invoiceId,
            double verifiedAmount
    ) {

        Invoice invoice =
                getInvoiceById(invoiceId);

        double total =
                invoice.getAmount() != null
                        ? invoice.getAmount()
                        : 0.0;

        double paid =
                Math.min(
                        Math.max(
                                verifiedAmount,
                                0.0
                        ),
                        total
                );

        invoice.setAmountPaid(
                round(paid)
        );

        if (paid >= total && total > 0) {

            invoice.setStatus(
                    InvoiceStatus.PAID
            );

        } else if (paid > 0) {

            invoice.setStatus(
                    InvoiceStatus.PARTIAL
            );

        } else {

            invoice.setStatus(
                    InvoiceStatus.PENDING
            );
        }

        return invoiceRepository.save(
                invoice
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteInvoice(
            Long id
    ) {

        if (
                !invoiceRepository
                        .existsById(id)
        ) {

            throw new IllegalArgumentException(
                    "Invoice not found with id: "
                            + id
            );
        }

        invoiceRepository.deleteById(id);
    }

    // =========================================================
    // FINANCE SUMMARY
    // =========================================================

    @Transactional(readOnly = true)
    public Map<String, Object>
    getFinanceSummary() {

        List<Invoice> all =
                invoiceRepository.findAll();

        double totalRevenue = 0.0;
        double paid = 0.0;
        double pending = 0.0;
        double overdue = 0.0;

        for (Invoice invoice : all) {

            double amount =
                    invoice.getAmount() != null
                            ? invoice.getAmount()
                            : 0.0;

            totalRevenue += amount;

            if (
                    invoice.getStatus() ==
                            InvoiceStatus.PAID
            ) {

                paid += amount;

            } else if (
                    invoice.getStatus() ==
                            InvoiceStatus.PENDING ||
                            invoice.getStatus() ==
                                    InvoiceStatus.PARTIAL
            ) {

                pending +=
                        Math.max(
                                amount -
                                        safe(
                                                invoice.getAmountPaid()
                                        ),
                                0
                        );

            } else if (
                    invoice.getStatus() ==
                            InvoiceStatus.OVERDUE
            ) {

                overdue +=
                        Math.max(
                                amount -
                                        safe(
                                                invoice.getAmountPaid()
                                        ),
                                0
                        );
            }
        }

        Map<String, Object> summary =
                new HashMap<>();

        summary.put(
                "totalRevenue",
                round(totalRevenue)
        );

        summary.put(
                "paid",
                round(paid)
        );

        summary.put(
                "pending",
                round(pending)
        );

        summary.put(
                "overdue",
                round(overdue)
        );

        summary.put(
                "invoiceCount",
                all.size()
        );

        return summary;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private double safe(
            Double value
    ) {

        return value != null
                ? value
                : 0.0;
    }

    private double round(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    private String generateInvoiceNumber() {

        Random random =
                new Random();

        for (
                int i = 0;
                i < 100;
                i++
        ) {

            String number =
                    "INV-" +
                            (2000 +
                                    random.nextInt(
                                            8000
                                    ));

            if (
                    !invoiceRepository
                            .existsByInvoiceNumber(
                                    number
                            )
            ) {

                return number;
            }
        }

        return "INV-" +
                System.currentTimeMillis();
    }
}