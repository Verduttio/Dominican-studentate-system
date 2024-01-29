package org.verduttio.dominicanappbackend.entity;

public class UserShortInfo {
    private Long id;
    private String name;
    private String surname;

    public UserShortInfo(Long id, String name, String surname) {
        this.id = id;
        this.name = name;
        this.surname = surname;
    }

    public UserShortInfo() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSurname() {
        return surname;
    }
}
