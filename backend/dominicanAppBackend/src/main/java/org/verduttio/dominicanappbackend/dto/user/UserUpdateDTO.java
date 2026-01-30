package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;
import java.util.Set;

public class UserUpdateDTO {
    private Long id;
    private String email;
    private String name;
    private String surname;
    private Set<String> roleNames;
    private Integer academicYear;
    private LocalDate namedayDate;

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }
    public Set<String> getRoleNames() { return roleNames; }
    public void setRoleNames(Set<String> roleNames) { this.roleNames = roleNames; }
    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }
    public LocalDate getNamedayDate() { return namedayDate; }
    public void setNamedayDate(LocalDate namedayDate) { this.namedayDate = namedayDate; }
}