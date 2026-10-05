package com.textile.backend.repository;

import com.textile.backend.entity.Delivery;
import com.textile.backend.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByDeliveryCode(String deliveryCode);

    boolean existsByDeliveryCode(String deliveryCode);

    List<Delivery> findByStatus(DeliveryStatus status);

    List<Delivery> findByOrderId(String orderId);

    @Query("SELECT d FROM Delivery d WHERE " +
           "LOWER(d.deliveryCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.orderId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.customer) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.officer) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Delivery> searchDeliveries(@Param("query") String query);
}
