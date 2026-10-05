package com.textile.backend.service;

import com.textile.backend.dto.ProductionTaskRequest;
import com.textile.backend.entity.Customer;
import com.textile.backend.entity.Order;
import com.textile.backend.entity.OrderStatus;
import com.textile.backend.entity.ProductionStage;
import com.textile.backend.entity.ProductionTask;
import com.textile.backend.repository.OrderRepository;
import com.textile.backend.repository.ProductionTaskRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@Transactional
public class ProductionTaskService {

    private final ProductionTaskRepository repository;
    private final OrderRepository orderRepository;

    public ProductionTaskService(
            ProductionTaskRepository repository,
            OrderRepository orderRepository
    ) {
        this.repository = repository;
        this.orderRepository = orderRepository;
    }

    /*
     * =====================================================
     * GET ALL PRODUCTION TASKS
     * =====================================================
     */
    @Transactional(readOnly = true)
    public List<ProductionTask> getAllTasks() {

        return repository.findAll();
    }

    /*
     * =====================================================
     * GET TASK
     * =====================================================
     */
    @Transactional(readOnly = true)
    public ProductionTask getTaskById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Production task not found with id: " + id
                        )
                );
    }

    /*
     * =====================================================
     * GET BY STAGE
     * =====================================================
     */
    @Transactional(readOnly = true)
    public List<ProductionTask> getTasksByStage(
            ProductionStage stage
    ) {

        return repository.findByStage(stage);
    }

    /*
     * =====================================================
     * SEARCH
     * =====================================================
     */
    @Transactional(readOnly = true)
    public List<ProductionTask> searchTasks(
            String query
    ) {

        if (
                query == null
                        || query.isBlank()
        ) {

            return repository.findAll();
        }

        return repository.searchTasks(
                query.trim()
        );
    }

    /*
     * =====================================================
     * APPROVED ORDERS
     * =====================================================
     *
     * Production page gets approved orders
     * directly from the orders table.
     */
    @Transactional(readOnly = true)
    public List<Order> getApprovedOrders() {

        return orderRepository
                .findByStatus(
                        OrderStatus.APPROVED
                );
    }

    /*
     * =====================================================
     * CREATE PRODUCTION TASK
     * =====================================================
     *
     * IMPORTANT:
     *
     * A production task can ONLY be created
     * for an APPROVED order.
     *
     * Once the production task is created,
     * the order becomes IN_PRODUCTION.
     */
    public ProductionTask createTask(
            ProductionTaskRequest request
    ) {

        if (
                request.getOrderRef() == null
                        || request.getOrderRef().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "An approved order must be selected"
            );
        }

        Order order =
                orderRepository
                        .findByOrderNumber(
                                request.getOrderRef().trim()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found: "
                                                + request.getOrderRef()
                                )
                        );

        /*
         * VERY IMPORTANT WORKFLOW CHECK.
         */
        if (
                order.getStatus()
                        != OrderStatus.APPROVED
        ) {

            throw new IllegalArgumentException(
                    "Production can start only after the order is approved. "
                            + "Current status: "
                            + order.getStatus()
            );
        }

        ProductionTask task =
                new ProductionTask();

        String code =
                request.getTaskCode();

        if (
                code == null
                        || code.isBlank()
        ) {

            code =
                    generateTaskCode();
        }

        task.setTaskCode(
                code
        );

        /*
         * =====================================================
         * GET VALUES FROM THE ACTUAL ORDER
         * =====================================================
         */

        task.setOrderRef(
                order.getOrderNumber()
        );

        /*
         * Order.customer is now a Customer entity.
         *
         * ProductionTask.customer is still a String.
         *
         * Therefore we store the customer's company name.
         */
        Customer customer = order.getCustomer();

        if (customer != null) {

            String customerDisplayName = customer.getCompany();

            if (
                    customerDisplayName == null
                            || customerDisplayName.isBlank()
            ) {
                customerDisplayName = customer.getName();
            }

            task.setCustomer(
                    customerDisplayName
            );
        } else {

            task.setCustomer(
                    null
            );
        }

        task.setGarmentType(
                order.getGarmentType()
        );

        task.setQuantity(
                order.getQuantity()
        );

        task.setStage(
                request.getStage()
                        != null
                        ? request.getStage()
                        : ProductionStage.CUTTING
        );

        task.setAssignedTo(
                request.getAssignedTo()
        );

        task.setStartDate(
                request.getStartDate()
                        != null
                        ? request.getStartDate()
                        : LocalDate.now()
        );

        task.setDueDate(
                request.getDueDate()
                        != null
                        ? request.getDueDate()
                        : order.getDeliveryDate()
        );

        task.setProgress(
                request.getProgress()
                        != null
                        ? request.getProgress()
                        : 0
        );

        task.setPriority(
                request.getPriority()
                        != null
                        ? request.getPriority()
                        : order.getPriority()
        );

        ProductionTask saved =
                repository.save(task);

        /*
         * =====================================================
         * APPROVED → IN PRODUCTION
         * =====================================================
         */
        order.setStatus(
                OrderStatus.IN_PRODUCTION
        );

        order.setProgress(
                50
        );

        orderRepository.save(
                order
        );

        return saved;
    }

    /*
     * =====================================================
     * UPDATE PROGRESS
     * =====================================================
     */
    public ProductionTask updateProgress(
            Long id,
            Integer progress,
            ProductionStage stage
    ) {

        ProductionTask task =
                getTaskById(id);

        if (progress != null) {

            task.setProgress(
                    Math.max(
                            0,
                            Math.min(
                                    100,
                                    progress
                            )
                    )
            );
        }

        if (stage != null) {

            task.setStage(
                    stage
            );
        }

        ProductionTask saved =
                repository.save(task);

        /*
         * Keep Order and Production synchronized.
         */
        orderRepository
                .findByOrderNumber(
                        saved.getOrderRef()
                )
                .ifPresent(order -> {

                    if (
                            saved.getProgress()
                                    >= 100
                    ) {

                        order.setStatus(
                                OrderStatus.READY
                        );

                        order.setProgress(
                                100
                        );

                    } else {

                        order.setStatus(
                                OrderStatus.IN_PRODUCTION
                        );

                        order.setProgress(
                                Math.max(
                                        50,
                                        saved.getProgress()
                                )
                        );
                    }

                    orderRepository.save(
                            order
                    );
                });

        return saved;
    }

    /*
     * =====================================================
     * UPDATE TASK
     * =====================================================
     */
    public ProductionTask updateTask(
            Long id,
            ProductionTaskRequest request
    ) {

        ProductionTask task =
                getTaskById(id);

        task.setAssignedTo(
                request.getAssignedTo()
        );

        task.setStartDate(
                request.getStartDate()
        );

        task.setDueDate(
                request.getDueDate()
        );

        task.setProgress(
                request.getProgress()
        );

        task.setStage(
                request.getStage()
        );

        task.setPriority(
                request.getPriority()
        );

        return repository.save(
                task
        );
    }

    /*
     * =====================================================
     * DELETE
     * =====================================================
     */
    public void deleteTask(
            Long id
    ) {

        if (
                !repository.existsById(id)
        ) {

            throw new IllegalArgumentException(
                    "Production task not found with id: "
                            + id
            );
        }

        repository.deleteById(id);
    }

    /*
     * =====================================================
     * TASK CODE
     * =====================================================
     */
    private String generateTaskCode() {

        Random random =
                new Random();

        for (
                int i = 0;
                i < 100;
                i++
        ) {

            String code =
                    "PT-"
                            + (
                            1000
                                    + random.nextInt(
                                    9000
                            )
                    );

            if (
                    !repository
                            .existsByTaskCode(code)
            ) {

                return code;
            }
        }

        return "PT-"
                + System.currentTimeMillis();
    }
}