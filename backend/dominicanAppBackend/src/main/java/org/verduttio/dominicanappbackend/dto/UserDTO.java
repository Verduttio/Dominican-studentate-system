package org.verduttio.dominicanappbackend.dto;

import org.verduttio.dominicanappbackend.entity.User;

import java.util.Set;

public class UserDTO {
    private String email;
    private String password;
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

    public UserDTO(String email, String password, Set<String> roleNames) {
        this.email = email;
        this.password = password;
        this.roleNames = roleNames;
    }

    public User basicFieldsToUser() {
        User user = new User();
        user.setEmail(this.email);
        user.setPassword(this.password);
        return user;
    }
}
