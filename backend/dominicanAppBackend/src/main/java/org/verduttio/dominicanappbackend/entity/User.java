package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

@Entity
@Table(name = "users")
public class User implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_id_generator")
    @SequenceGenerator(name="user_id_generator", sequenceName = "user_id_seq", allocationSize=1)
    private Long id;

    private String email;

    @JsonIgnore
    private String password;

    private String name;

    private String surname;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    @JsonIgnore
    @Column(name = "is_enabled", nullable = false, columnDefinition = "boolean default false")
    private boolean isEnabled;

    @Column(name = "failed_login_attempts", nullable = false, columnDefinition = "int default 0")
    private int failedLoginAttempts;

    @JsonIgnore
    private LocalDateTime lockTime;



    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Set<Role> getRoles() {
        TreeSet<Role> sortedRoles = new TreeSet<>(Comparator.comparing(Role::getName));
        sortedRoles.addAll(this.roles);
        return sortedRoles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public boolean isEnabled() {
        return isEnabled;
    }

    public void setEnabled(boolean isEnabled) {
        this.isEnabled = isEnabled;
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

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }


    // Constructors
    public User() {
    }

    public User(String email, String password, Set<Role> roles,
                String name, String surname, AuthProvider provider,
                boolean isEnabled, int failedLoginAttempts, LocalDateTime lockTime) {
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.name = name;
        this.surname = surname;
        this.provider = provider;
        this.isEnabled = isEnabled;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockTime = lockTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return user.getEmail().equals(this.email);
    }

    @Override
    public int hashCode() {
        return email.hashCode();
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLockTime() {
        return lockTime;
    }

    public void setLockTime(LocalDateTime lockTime) {
        this.lockTime = lockTime;
    }
}
