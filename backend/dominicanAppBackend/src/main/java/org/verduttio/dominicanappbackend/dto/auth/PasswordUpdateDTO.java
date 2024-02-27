package org.verduttio.dominicanappbackend.dto.auth;

import jakarta.validation.constraints.Size;

public class PasswordUpdateDTO {
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String newPassword;

    public PasswordUpdateDTO() {
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
