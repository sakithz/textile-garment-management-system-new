package com.textile.backend.service;

import com.textile.backend.dto.EmployeeRequest;
import com.textile.backend.entity.Employee;
import com.textile.backend.entity.EmployeeStatus;
import com.textile.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
    }

    public List<Employee> getEmployeesByDepartment(String department) {
        return repository.findByDepartment(department);
    }

    public List<Employee> getEmployeesByStatus(EmployeeStatus status) {
        return repository.findByStatus(status);
    }

    public List<Employee> searchEmployees(String query) {
        if (query == null || query.isBlank()) {
            return repository.findAll();
        }
        return repository.searchEmployees(query.trim());
    }

    public Employee createEmployee(EmployeeRequest request) {
        Employee employee = new Employee();

        String code = request.getEmployeeCode();
        if (code == null || code.isBlank()) {
            code = generateEmployeeCode();
        }
        employee.setEmployeeCode(code);
        employee.setName(request.getName());
        employee.setRole(request.getRole());
        employee.setDepartment(request.getDepartment());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setStatus(request.getStatus() != null ? request.getStatus() : EmployeeStatus.ACTIVE);
        employee.setJoinDate(request.getJoinDate() != null ? request.getJoinDate() : LocalDate.now());
        employee.setSalary(request.getSalary() != null ? request.getSalary() : 0.0);

        return repository.save(employee);
    }

    public Employee updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = getEmployeeById(id);

        employee.setName(request.getName());
        employee.setRole(request.getRole());
        employee.setDepartment(request.getDepartment());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        if (request.getStatus() != null) {
            employee.setStatus(request.getStatus());
        }
        if (request.getJoinDate() != null) {
            employee.setJoinDate(request.getJoinDate());
        }
        if (request.getSalary() != null) {
            employee.setSalary(request.getSalary());
        }

        return repository.save(employee);
    }

    public Employee updateStatus(Long id, EmployeeStatus status) {
        Employee employee = getEmployeeById(id);
        employee.setStatus(status);
        return repository.save(employee);
    }

    public void deleteEmployee(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Employee not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private String generateEmployeeCode() {
        Random random = new Random();
        for (int i = 0; i < 100; i++) {
            String code = "EMP" + String.format("%03d", 100 + random.nextInt(900));
            if (!repository.existsByEmployeeCode(code)) {
                return code;
            }
        }
        return "EMP" + System.currentTimeMillis();
    }
}
