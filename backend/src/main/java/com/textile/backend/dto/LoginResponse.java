package com.textile.backend.dto;

import com.textile.backend.entity.UserRole;

public class LoginResponse {

    private String id;

    private Long numericId;

    private String name;

    private String email;

    private UserRole role;

    private String avatar;

    private String department;

    private String message;

    /*
     * Authentication token
     */
    private String token;


    public LoginResponse() {
    }


    public LoginResponse(
            String id,
            Long numericId,
            String name,
            String email,
            UserRole role,
            String avatar,
            String department,
            String message,
            String token
    ) {

        this.id = id;

        this.numericId = numericId;

        this.name = name;

        this.email = email;

        this.role = role;

        this.avatar = avatar;

        this.department = department;

        this.message = message;

        this.token = token;
    }


    public String getId() {
        return id;
    }


    public void setId(String id) {
        this.id = id;
    }


    public Long getNumericId() {
        return numericId;
    }


    public void setNumericId(Long numericId) {
        this.numericId = numericId;
    }


    public String getName() {
        return name;
    }


    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public UserRole getRole() {
        return role;
    }


    public void setRole(UserRole role) {
        this.role = role;
    }


    public String getAvatar() {
        return avatar;
    }


    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }


    public String getDepartment() {
        return department;
    }


    public void setDepartment(String department) {
        this.department = department;
    }


    public String getMessage() {
        return message;
    }


    public void setMessage(String message) {
        this.message = message;
    }


    public String getToken() {
        return token;
    }


    public void setToken(String token) {
        this.token = token;
    }
}