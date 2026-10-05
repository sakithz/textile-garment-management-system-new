package com.textile.backend.service;

import com.textile.backend.dto.LoginRequest;
import com.textile.backend.dto.LoginResponse;
import com.textile.backend.dto.UserRequest;

import com.textile.backend.entity.Employee;
import com.textile.backend.entity.EmployeeStatus;
import com.textile.backend.entity.User;
import com.textile.backend.entity.UserRole;

import com.textile.backend.repository.EmployeeRepository;
import com.textile.backend.repository.UserRepository;

import com.textile.backend.security.AuthTokenService;

import jakarta.annotation.PostConstruct;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
@Transactional
public class UserService {


    private final UserRepository repository;

    private final EmployeeRepository employeeRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthTokenService tokenService;


    public UserService(
            UserRepository repository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            AuthTokenService tokenService
    ) {

        this.repository =
                repository;

        this.employeeRepository =
                employeeRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.tokenService =
                tokenService;
    }


    /*
     * =====================================================
     * INITIAL ADMIN
     * =====================================================
     *
     * Only Admin is created automatically.
     */
    @PostConstruct
    public void initDefaultAdmin() {


        /*
         * Remove old demo users that are not linked
         * to an Employee.
         */
        repository.findAll()
                .stream()

                .filter(
                        user ->
                                user.getRole()
                                        != UserRole.ADMIN
                                        &&
                                        user.getEmployee()
                                                == null
                )

                .forEach(
                        repository::delete
                );


        /*
         * Create Admin only if there is no Admin.
         */
        if (!repository.existsByRole(
                UserRole.ADMIN
        )) {


            User admin =
                    new User();


            admin.setUserCode(
                    "u1"
            );


            admin.setName(
                    "Arjun Mehta"
            );


            admin.setRole(
                    UserRole.ADMIN
            );


            admin.setEmail(
                    "arjun@fabriqs.com"
            );


            admin.setAvatar(
                    "AM"
            );


            admin.setDepartment(
                    "Management"
            );


            /*
             * Store Admin password as BCrypt.
             */
            admin.setPassword(
                    passwordEncoder.encode(
                            "password"
                    )
            );


            admin.setActive(
                    true
            );


            repository.save(
                    admin
            );
        }
    }


    /*
     * =====================================================
     * GET ALL USERS
     * =====================================================
     */

    public List<User> getAllUsers() {

        return repository.findAll();
    }


    /*
     * =====================================================
     * GET USER
     * =====================================================
     */

    public User getUserById(
            Long id
    ) {

        return repository.findById(id)

                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "User not found with id: "
                                                + id
                                )
                );
    }


    /*
     * =====================================================
     * LOGIN
     * =====================================================
     */

    public LoginResponse authenticate(
            LoginRequest request
    ) {


        Optional<User> userOpt =
                repository.findByEmail(
                        request.getEmail()
                                .trim()
                                .toLowerCase()
                );


        if (userOpt.isEmpty()) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }


        User user =
                userOpt.get();


        String rawPassword =
                request.getPassword()
                        .trim();


        /*
         * Check password.
         *
         * Supports:
         *
         * 1. Existing plaintext password
         * 2. BCrypt password
         */
        if (!passwordMatches(
                user.getPassword(),
                rawPassword
        )) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }


        /*
         * Inactive users cannot login.
         */
        if (!Boolean.TRUE.equals(
                user.getActive()
        )) {

            throw new IllegalArgumentException(
                    "User account is inactive. Please contact administrator."
            );
        }


        /*
         * If an old plaintext password was used,
         * automatically upgrade it to BCrypt.
         */
        if (!isEncodedPassword(
                user.getPassword()
        )) {

            user.setPassword(
                    passwordEncoder.encode(
                            rawPassword
                    )
            );

            repository.save(
                    user
            );
        }


        /*
         * =================================================
         * CREATE AUTHENTICATION TOKEN
         * =================================================
         */

        String token =
                tokenService.createToken(
                        user.getId()
                );


        /*
         * Return user information + token.
         */
        return new LoginResponse(
                user.getUserCode(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatar(),
                user.getDepartment(),
                "Login successful",
                token
        );
    }


    /*
     * =====================================================
     * CREATE USER
     * =====================================================
     */

    public User createUser(
            UserRequest request
    ) {


        if (request.getEmployeeId()
                == null) {

            throw new IllegalArgumentException(
                    "An employee must be selected"
            );
        }


        /*
         * Admin cannot create another Admin
         * from User Management.
         */
        if (request.getRole() == null ||
                request.getRole()
                        == UserRole.ADMIN) {

            throw new IllegalArgumentException(
                    "Select a valid stakeholder role"
            );
        }


        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }


        Employee employee =
                employeeRepository
                        .findById(
                                request.getEmployeeId()
                        )

                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Employee not found"
                                        )
                        );


        /*
         * Only active employees can
         * receive accounts.
         */
        if (employee.getStatus()
                != EmployeeStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "Only active employees can be assigned a user account"
            );
        }


        /*
         * One employee = one account.
         */
        if (repository.existsByEmployeeId(
                employee.getId()
        )) {

            throw new IllegalArgumentException(
                    "This employee already has a user account"
            );
        }


        String email =
                employee.getEmail()
                        .trim()
                        .toLowerCase();


        /*
         * Email must be unique.
         */
        if (repository.existsByEmail(
                email
        )) {

            throw new IllegalArgumentException(
                    "This employee email is already assigned to a user account"
            );
        }


        User user =
                new User();


        /*
         * Generate user code.
         */
        String userCode =
                "USR-"
                        + employee.getEmployeeCode();


        if (repository.existsByUserCode(
                userCode
        )) {

            userCode =
                    "USR-"
                            + employee.getId();
        }


        user.setUserCode(
                userCode
        );


        /*
         * Employee data.
         */
        user.setName(
                employee.getName()
        );


        user.setEmail(
                email
        );


        user.setDepartment(
                employee.getDepartment()
        );


        /*
         * Selected stakeholder role.
         */
        user.setRole(
                request.getRole()
        );


        /*
         * BCrypt password.
         */
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                                .trim()
                )
        );


        /*
         * Avatar.
         */
        user.setAvatar(
                createAvatar(
                        employee.getName()
                )
        );


        user.setActive(
                true
        );


        /*
         * Link User to Employee.
         */
        user.setEmployee(
                employee
        );


        return repository.save(
                user
        );
    }


    /*
     * =====================================================
     * UPDATE USER
     * =====================================================
     */

    public User updateUser(
            Long id,
            UserRequest request
    ) {


        User user =
                getUserById(id);


        user.setName(
                request.getName()
        );


        if (request.getRole()
                != null) {


            /*
             * Admin cannot be downgraded.
             */
            if (
                    user.getRole()
                            == UserRole.ADMIN
                            &&
                            request.getRole()
                                    != UserRole.ADMIN
            ) {

                throw new IllegalArgumentException(
                        "The administrator role cannot be changed here"
                );
            }


            user.setRole(
                    request.getRole()
            );
        }


        /*
         * Change password only if provided.
         */
        if (
                request.getPassword()
                        != null
                        &&
                        !request.getPassword()
                                .isBlank()
        ) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                                    .trim()
                    )
            );
        }


        if (request.getDepartment()
                != null) {

            user.setDepartment(
                    request.getDepartment()
            );
        }


        if (request.getActive()
                != null) {

            user.setActive(
                    request.getActive()
            );
        }


        return repository.save(
                user
        );
    }


    /*
     * =====================================================
     * DELETE USER
     * =====================================================
     */

    public void deleteUser(
            Long id
    ) {


        User user =
                getUserById(id);


        /*
         * Admin cannot be deleted.
         */
        if (user.getRole()
                == UserRole.ADMIN) {

            throw new IllegalArgumentException(
                    "The administrator account cannot be deleted"
            );
        }


        repository.delete(
                user
        );
    }


    /*
     * =====================================================
     * PASSWORD HELPERS
     * =====================================================
     */

    private boolean isEncodedPassword(
            String password
    ) {

        return password != null
                &&
                (
                        password.startsWith("$2a$")
                                ||
                                password.startsWith("$2b$")
                                ||
                                password.startsWith("$2y$")
                );
    }


    private boolean passwordMatches(
            String storedPassword,
            String rawPassword
    ) {


        /*
         * BCrypt password.
         */
        if (isEncodedPassword(
                storedPassword
        )) {

            return passwordEncoder.matches(
                    rawPassword,
                    storedPassword
            );
        }


        /*
         * Old plaintext password.
         *
         * This allows the existing Admin account
         * to login once and then be upgraded.
         */
        return storedPassword != null
                &&
                storedPassword.equals(
                        rawPassword
                );
    }


    /*
     * =====================================================
     * AVATAR
     * =====================================================
     */

    private String createAvatar(
            String name
    ) {


        String[] parts =
                name.trim()
                        .split("\\s+");


        StringBuilder avatar =
                new StringBuilder();


        for (String part : parts) {

            if (!part.isEmpty()) {

                avatar.append(
                        Character.toUpperCase(
                                part.charAt(0)
                        )
                );
            }
        }


        return avatar.length() > 0

                ?

                avatar.substring(
                        0,
                        Math.min(
                                2,
                                avatar.length()
                        )
                )

                :

                "US";
    }
}