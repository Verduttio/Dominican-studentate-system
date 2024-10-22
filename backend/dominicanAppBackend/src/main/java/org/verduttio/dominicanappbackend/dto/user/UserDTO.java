package org.verduttio.dominicanappbackend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.verduttio.dominicanappbackend.domain.User;

import java.util.Set;

public class UserDTO {
    @Email(message="Please provide a valid email address")
    @NotBlank(message="Email is mandatory")
    private String email;

    @Size(min=8, message="Password with at least 8 characters is mandatory")
    @NotBlank(message="Password is mandatory")
    private String password;

    @NotBlank(message="Name is mandatory")
    private String name;

    @NotBlank(message="Surname is mandatory")
    private String surname;

    private Set<String> roleNames;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRoleNames() {
        return roleNames;
    }

    public void setRoleNames(Set<String> roleNames) {
        this.roleNames = roleNames;
    }

    // Constructors
    public UserDTO() {
    }

    public UserDTO(String email, String password, Set<String> roleNames,
                   String name, String surname) {
        this.email = email;
        this.password = password;
        this.roleNames = roleNames;
        this.name = name;
        this.surname = surname;
    }

    public User basicFieldsToUser() {
        User user = new User();
        user.setEmail(this.email);
        user.setPassword(this.password);
        user.setName(this.name);
        user.setSurname(this.surname);
        return user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }
}
