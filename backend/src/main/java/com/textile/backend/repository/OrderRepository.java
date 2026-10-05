package com.textile.backend.repository;

import com.textile.backend.entity.Order;
import com.textile.backend.entity.OrderStatus;
import com.textile.backend.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // ============================================================
    // BASIC ORDER LOOKUPS
    // ============================================================

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);


    // ============================================================
    // STATUS
    // ============================================================

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);


    // ============================================================
    // PRIORITY
    // ============================================================

    List<Order> findByPriority(Priority priority);


    // ============================================================
    // CUSTOMER
    // ============================================================

    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    List<Order> findByCustomerId(Long customerId);


    // ============================================================
    // CUSTOMER SEARCH
    // ============================================================

    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);

    List<Order> findByCustomerCompanyContainingIgnoreCase(String company);


    // ============================================================
    // GARMENT SEARCH
    // ============================================================

    List<Order> findByGarmentTypeContainingIgnoreCase(String garmentType);


    // ============================================================
    // GENERAL SEARCH
    // ============================================================

    @Query("SELECT o FROM Order o WHERE " +
            "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(o.garmentType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(o.customer.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(o.customer.company) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(o.customer.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Order> searchOrders(@Param("query") String query);


    // ============================================================
    // ORDER DATE
    // ============================================================

    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findAllByOrderDateDesc();


    // ============================================================
    // QUOTATION
    // ============================================================

    Optional<Order> findByQuotationId(Long quotationId);
}