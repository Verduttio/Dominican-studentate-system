package org.verduttio.dominicanappbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterUserRequest {
    @NotBlank(message="Name is mandatory")
    private String name;

    @NotBlank(message="Surname is mandatory")
    private String surname;

    @Email(message="Please provide a valid email address")
    @NotBlank(message="Email is mandatory")
    private String email;

    @Size(min=8, message="Password with at least 8 characters is mandatory")
    @NotBlank(message="Password is mandatory")
    private String password;

    public RegisterUserRequest() {
    }

    public RegisterUserRequest(String name, String surname, String email, String password) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public String getSurname() {
        return surname;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
