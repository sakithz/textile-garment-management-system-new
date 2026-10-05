package com.textile.backend.service;

import com.textile.backend.dto.OrderRequest;
import com.textile.backend.entity.Customer;
import com.textile.backend.entity.Order;
import com.textile.backend.entity.OrderStatus;
import com.textile.backend.entity.Priority;
import com.textile.backend.entity.Quotation;
import com.textile.backend.entity.QuotationStatus;
import com.textile.backend.repository.CustomerRepository;
import com.textile.backend.repository.OrderRepository;
import com.textile.backend.repository.QuotationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final QuotationRepository quotationRepository;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            QuotationRepository quotationRepository) {

        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.quotationRepository = quotationRepository;
    }

    // =========================
    // GET ALL ORDERS
    // =========================

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderDateDesc();
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: " + id
                        ));
    }

    // =========================
    // GET ORDER BY NUMBER
    // =========================

    @Transactional(readOnly = true)
    public Order getOrderByNumber(String orderNumber) {

        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with order number: "
                                        + orderNumber
                        ));
    }

    // =========================
    // GET ORDERS BY CUSTOMER
    // =========================

    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(Long customerId) {

        if (!customerRepository.existsById(customerId)) {

            throw new RuntimeException(
                    "Customer not found with ID: " + customerId
            );
        }

        return orderRepository
                .findByCustomerIdOrderByOrderDateDesc(
                        customerId
                );
    }

    // =========================
    // GET ORDERS BY STATUS
    // =========================

    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(
            OrderStatus status) {

        return orderRepository
                .findByStatusOrderByOrderDateDesc(status);
    }

    // =========================
    // SEARCH ORDERS
    // =========================

    @Transactional(readOnly = true)
    public List<Order> searchOrders(String query) {

        if (query == null ||
                query.trim().isEmpty()) {

            return getAllOrders();
        }

        return orderRepository.searchOrders(
                query.trim()
        );
    }

    // =========================
    // CREATE ORDER
    // =========================

    public Order createOrder(OrderRequest request) {

        validateOrderRequest(request);

        Customer customer =
                customerRepository.findById(
                        request.getCustomerId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: "
                                        + request.getCustomerId()
                        ));

        Order order = new Order();

        order.setOrderNumber(
                generateOrderNumber()
        );

        order.setCustomer(customer);

        order.setGarmentType(
                request.getGarmentType().trim()
        );

        order.setQuantity(
                request.getQuantity()
        );

        order.setOrderDate(
                request.getOrderDate() != null
                        ? request.getOrderDate()
                        : LocalDate.now()
        );

        order.setDeliveryDate(
                request.getDeliveryDate()
        );

        order.setPriority(
                request.getPriority() != null
                        ? request.getPriority()
                        : Priority.MEDIUM
        );

        order.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : OrderStatus.PENDING
        );

        order.setProgress(
                request.getProgress() != null
                        ? request.getProgress()
                        : 0
        );

        order.setUnitPrice(
                request.getUnitPrice()
        );

        calculateOrderTotal(order, request.getTotal());

        order.setFabric(
                request.getFabric()
        );

        order.setColor(
                request.getColor()
        );

        order.setSize(
                request.getSize()
        );

        // =========================
        // OPTIONAL QUOTATION
        // =========================

        if (request.getQuotationId() != null) {

            Quotation quotation =
                    quotationRepository.findById(
                            request.getQuotationId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Quotation not found with ID: "
                                            + request.getQuotationId()
                            ));

            validateQuotationForCustomer(
                    quotation,
                    customer
            );

            if (orderRepository
                    .findByQuotationId(
                            request.getQuotationId()
                    )
                    .isPresent()) {

                throw new RuntimeException(
                        "This quotation has already been converted into an order"
                );
            }

            order.setQuotation(quotation);
        }

        Order savedOrder =
                orderRepository.save(order);

        updateCustomerOrderInformation(
                customer,
                savedOrder
        );

        return savedOrder;
    }

    // =========================
    // CREATE ORDER FROM QUOTATION
    // =========================

    public Order createOrderFromQuotation(
            Long quotationId,
            Priority priority) {

        Quotation quotation =
                quotationRepository.findById(
                        quotationId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Quotation not found with ID: "
                                        + quotationId
                        ));

        if (orderRepository
                .findByQuotationId(quotationId)
                .isPresent()) {

            throw new RuntimeException(
                    "This quotation has already been converted into an order"
            );
        }

        if (quotation.getCustomer() == null) {

            throw new RuntimeException(
                    "Quotation does not have a customer"
            );
        }

        if (quotation.getStatus() !=
                QuotationStatus.APPROVED) {

            throw new RuntimeException(
                    "Only an approved quotation can be converted into an order"
            );
        }

        if (quotation.getUnitPrice() == null) {

            throw new RuntimeException(
                    "Approved quotation must have a unit price"
            );
        }

        if (quotation.getTotalPrice() == null) {

            throw new RuntimeException(
                    "Approved quotation must have a total price"
            );
        }

        Order order = new Order();

        order.setOrderNumber(
                generateOrderNumber()
        );

        order.setCustomer(
                quotation.getCustomer()
        );

        order.setQuotation(
                quotation
        );

        order.setGarmentType(
                quotation.getGarmentType()
        );

        order.setQuantity(
                quotation.getQuantity()
        );

        order.setOrderDate(
                LocalDate.now()
        );

        order.setDeliveryDate(
                quotation.getConfirmedDeliveryDate() != null
                        ? quotation.getConfirmedDeliveryDate()
                        : quotation.getRequestedDeliveryDate()
        );

        order.setPriority(
                priority != null
                        ? priority
                        : quotation.getPriority() != null
                        ? quotation.getPriority()
                        : Priority.MEDIUM
        );

        order.setStatus(
                OrderStatus.PENDING
        );

        order.setProgress(0);

        order.setUnitPrice(
                quotation.getUnitPrice()
        );

        order.setTotal(
                quotation.getTotalPrice()
        );

        order.setFabric(
                quotation.getFabric()
        );

        order.setColor(
                quotation.getColor()
        );

        order.setSize(
                quotation.getSize()
        );

        Order savedOrder =
                orderRepository.save(order);

        // =========================
        // UPDATE QUOTATION
        // =========================

        quotation.setStatus(
                QuotationStatus.CONVERTED_TO_ORDER
        );

        quotation.setOrder(
                savedOrder
        );

        quotationRepository.save(
                quotation
        );

        // =========================
        // UPDATE CUSTOMER
        // =========================

        updateCustomerOrderInformation(
                quotation.getCustomer(),
                savedOrder
        );

        return savedOrder;
    }

    // =========================
    // UPDATE ORDER
    // =========================

    public Order updateOrder(
            Long id,
            OrderRequest request) {

        Order order =
                getOrderById(id);

        if (request == null) {

            throw new RuntimeException(
                    "Order request cannot be null"
            );
        }

        // =========================
        // CUSTOMER
        // =========================

        if (request.getCustomerId() != null &&
                (order.getCustomer() == null ||
                        !order.getCustomer()
                                .getId()
                                .equals(
                                        request.getCustomerId()
                                ))) {

            Customer customer =
                    customerRepository.findById(
                            request.getCustomerId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found with ID: "
                                            + request.getCustomerId()
                            ));

            order.setCustomer(customer);
        }

        // =========================
        // BASIC DETAILS
        // =========================

        if (request.getGarmentType() != null &&
                !request.getGarmentType()
                        .trim()
                        .isEmpty()) {

            order.setGarmentType(
                    request.getGarmentType().trim()
            );
        }

        if (request.getQuantity() != null) {

            if (request.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Quantity must be greater than zero"
                );
            }

            order.setQuantity(
                    request.getQuantity()
            );
        }

        if (request.getOrderDate() != null) {

            order.setOrderDate(
                    request.getOrderDate()
            );
        }

        if (request.getDeliveryDate() != null) {

            order.setDeliveryDate(
                    request.getDeliveryDate()
            );
        }

        // =========================
        // PRIORITY / STATUS
        // =========================

        if (request.getPriority() != null) {

            order.setPriority(
                    request.getPriority()
            );
        }

        if (request.getStatus() != null) {

            order.setStatus(
                    request.getStatus()
            );
        }

        // =========================
        // PROGRESS
        // =========================

        if (request.getProgress() != null) {

            if (request.getProgress() < 0 ||
                    request.getProgress() > 100) {

                throw new RuntimeException(
                        "Progress must be between 0 and 100"
                );
            }

            order.setProgress(
                    request.getProgress()
            );
        }

        // =========================
        // PRICE
        // =========================

        if (request.getUnitPrice() != null) {

            if (request.getUnitPrice() < 0) {

                throw new RuntimeException(
                        "Unit price cannot be negative"
                );
            }

            order.setUnitPrice(
                    request.getUnitPrice()
            );
        }

        calculateOrderTotal(
                order,
                request.getTotal()
        );

        // =========================
        // OTHER DETAILS
        // =========================

        if (request.getFabric() != null) {

            order.setFabric(
                    request.getFabric()
            );
        }

        if (request.getColor() != null) {

            order.setColor(
                    request.getColor()
            );
        }

        if (request.getSize() != null) {

            order.setSize(
                    request.getSize()
            );
        }

        return orderRepository.save(order);
    }

    // =========================
    // DELETE ORDER
    // =========================

    public void deleteOrder(Long id) {

        Order order =
                getOrderById(id);

        orderRepository.delete(order);
    }

    // =========================
    // VALIDATE ORDER REQUEST
    // =========================

    private void validateOrderRequest(
            OrderRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Order request cannot be null"
            );
        }

        if (request.getCustomerId() == null) {

            throw new RuntimeException(
                    "Customer is required"
            );
        }

        if (request.getGarmentType() == null ||
                request.getGarmentType()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Garment type is required"
            );
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }
    }

    // =========================
    // VALIDATE QUOTATION CUSTOMER
    // =========================

    private void validateQuotationForCustomer(
            Quotation quotation,
            Customer customer) {

        if (quotation.getCustomer() == null) {

            throw new RuntimeException(
                    "Quotation does not have a customer"
            );
        }

        if (!quotation.getCustomer()
                .getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "Quotation does not belong to the selected customer"
            );
        }
    }

    // =========================
    // CALCULATE TOTAL
    // =========================

    private void calculateOrderTotal(
            Order order,
            Double requestedTotal) {

        if (order.getUnitPrice() != null &&
                order.getQuantity() != null) {

            order.setTotal(
                    order.getQuantity()
                            * order.getUnitPrice()
            );

            return;
        }

        if (requestedTotal != null) {

            if (requestedTotal < 0) {

                throw new RuntimeException(
                        "Total cannot be negative"
                );
            }

            order.setTotal(
                    requestedTotal
            );

            return;
        }

        order.setTotal(0.0);
    }

    // =========================
    // GENERATE ORDER NUMBER
    // =========================

    private String generateOrderNumber() {

        String orderNumber;

        do {

            int number =
                    1000 + (int) (
                            Math.random() * 9000
                    );

            orderNumber =
                    "ORD-" + number;

        } while (
                orderRepository
                        .existsByOrderNumber(
                                orderNumber
                        )
        );

        return orderNumber;
    }

    // =========================
    // UPDATE CUSTOMER STATISTICS
    // =========================

    private void updateCustomerOrderInformation(
            Customer customer,
            Order order) {

        if (customer == null) {
            return;
        }

        Integer currentOrders =
                customer.getTotalOrders();

        if (currentOrders == null) {
            currentOrders = 0;
        }

        customer.setTotalOrders(
                currentOrders + 1
        );

        customer.setLastOrder(
                order.getOrderDate() != null
                        ? order.getOrderDate()
                        : LocalDate.now()
        );

        Double currentValue =
                customer.getTotalValue();

        if (currentValue == null) {
            currentValue = 0.0;
        }

        Double orderValue =
                order.getTotal();

        if (orderValue == null) {
            orderValue = 0.0;
        }

        customer.setTotalValue(
                currentValue + orderValue
        );

        customerRepository.save(customer);
    }
}