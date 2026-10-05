package com.textile.backend.repository;

import com.textile.backend.entity.ProductionStage;
import com.textile.backend.entity.ProductionTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionTaskRepository extends JpaRepository<ProductionTask, Long> {

    Optional<ProductionTask> findByTaskCode(String taskCode);

    boolean existsByTaskCode(String taskCode);

    List<ProductionTask> findByStage(ProductionStage stage);

    List<ProductionTask> findByOrderRef(String orderRef);

    @Query("SELECT p FROM ProductionTask p WHERE " +
           "LOWER(p.customer) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.garmentType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.orderRef) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.assignedTo) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ProductionTask> searchTasks(@Param("query") String query);
}
