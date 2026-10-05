package com.textile.backend.controller;

import com.textile.backend.dto.ProductionTaskRequest;
import com.textile.backend.entity.Order;
import com.textile.backend.entity.ProductionStage;
import com.textile.backend.entity.ProductionTask;
import com.textile.backend.service.ProductionTaskService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/tasks")
@CrossOrigin(
        origins = {
                "http://localhost:8443",
                "http://127.0.0.1:8443"
        }
)
public class ProductionTaskController {

    private final ProductionTaskService service;

    public ProductionTaskController(
            ProductionTaskService service
    ) {

        this.service =
                service;
    }

    /*
     * GET ALL TASKS
     */
    @GetMapping
    public ResponseEntity<List<ProductionTask>>
    getAllTasks() {

        return ResponseEntity.ok(
                service.getAllTasks()
        );
    }

    /*
     * GET APPROVED ORDERS
     *
     * Production page uses this endpoint.
     */
    @GetMapping("/approved-orders")
    public ResponseEntity<List<Order>>
    getApprovedOrders() {

        return ResponseEntity.ok(
                service.getApprovedOrders()
        );
    }

    /*
     * GET TASK BY ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductionTask>
    getTaskById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getTaskById(id)
        );
    }

    /*
     * GET TASKS BY STAGE
     */
    @GetMapping("/stage/{stage}")
    public ResponseEntity<List<ProductionTask>>
    getTasksByStage(
            @PathVariable
            ProductionStage stage
    ) {

        return ResponseEntity.ok(
                service.getTasksByStage(stage)
        );
    }

    /*
     * SEARCH
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductionTask>>
    searchTasks(
            @RequestParam(
                    required = false
            )
            String query
    ) {

        return ResponseEntity.ok(
                service.searchTasks(query)
        );
    }

    /*
     * CREATE PRODUCTION TASK
     */
    @PostMapping
    public ResponseEntity<ProductionTask>
    createTask(
            @Valid
            @RequestBody
            ProductionTaskRequest request
    ) {

        ProductionTask task =
                service.createTask(
                        request
                );

        return new ResponseEntity<>(
                task,
                HttpStatus.CREATED
        );
    }

    /*
     * UPDATE PROGRESS
     */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<ProductionTask>
    updateProgress(
            @PathVariable Long id,

            @RequestParam(
                    required = false
            )
            Integer progress,

            @RequestParam(
                    required = false
            )
            ProductionStage stage
    ) {

        return ResponseEntity.ok(
                service.updateProgress(
                        id,
                        progress,
                        stage
                )
        );
    }

    /*
     * UPDATE TASK
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductionTask>
    updateTask(
            @PathVariable Long id,

            @Valid
            @RequestBody
            ProductionTaskRequest request
    ) {

        return ResponseEntity.ok(
                service.updateTask(
                        id,
                        request
                )
        );
    }

    /*
     * DELETE TASK
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteTask(
            @PathVariable Long id
    ) {

        service.deleteTask(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}