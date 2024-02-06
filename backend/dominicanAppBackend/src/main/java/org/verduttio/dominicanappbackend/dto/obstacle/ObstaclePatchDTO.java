package org.verduttio.dominicanappbackend.dto.obstacle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ObstaclePatchDTO {
    @NotBlank(message="Status is mandatory")
    private String status;

    private String recipientAnswer;

    @NotNull(message="Recipient user id is mandatory")
    private Long recipientUserId;

    // Getters and setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRecipientAnswer() {
        return recipientAnswer;
    }

    public void setRecipientAnswer(String recipientAnswer) {
        this.recipientAnswer = recipientAnswer;
    }

    public Long getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(Long recipientUserId) {
        this.recipientUserId = recipientUserId;
    }
}

