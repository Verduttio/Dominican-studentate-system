package org.verduttio.dominicanappbackend.dto.user;

public class UserNameSurnameDTO {
    private String name;
    private String surname;

    public UserNameSurnameDTO() {
    }

    public UserNameSurnameDTO(String name, String surname) {
        this.name = name;
        this.surname = surname;
    }

    public String getName() {
        return name;
    }

    public String getSurname() {
        return surname;
    }
}
