package org.verduttio.dominicanappbackend.dto.user;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public class GuestUserDTO {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Surname cannot be blank")
    private String surname;

    private Set<String> roleNames;

    public GuestUserDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public Set<String> getRoleNames() { return roleNames; }
    public void setRoleNames(Set<String> roleNames) { this.roleNames = roleNames; }
}