package org.verduttio.dominicanappbackend.dto;

public class ObstaclePatchDTO {

    private String status;

    private String recipientAnswer;

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

