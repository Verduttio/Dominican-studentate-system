package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.io.Serial;
import java.io.Serializable;

@Entity
@Table(name = "roles")
public class Role implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_id_generator")
    @SequenceGenerator(name="role_id_generator", sequenceName = "role_id_seq", allocationSize=1)
    private Long id;

    @NotBlank(message="Role name is mandatory")
    private String name;

    @Enumerated(EnumType.STRING)
    private RoleType type;


    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RoleType getType() {
        return type;
    }

    public void setType(RoleType type) {
        this.type = type;
    }

    // Constructors
    public Role() {
    }

    public Role(String name, RoleType type) {
        this.name = name;
        this.type = type;
    }

    @Override
    public String toString() {
        return "Role{" +
                "id=" + id +
                ", name='" + name +
                ", type='" + type +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Role )) return false;
        return name != null && name.equals(((Role) o).getName());
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }

}
