package org.verduttio.dominicanappbackend.dto;

import org.verduttio.dominicanappbackend.entity.ObstacleStatus;

import java.time.LocalDate;

public class ObstacleDTO {
    private Long userId;
    private Long taskId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String applicantDescription;
    private ObstacleStatus status;
    private String recipientAnswer;
    private Long recipientUserId;

    // Getters and setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
    }

    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }

    public String getApplicantDescription() {
        return applicantDescription;
    }

    public void setApplicantDescription(String applicantDescription) {
        this.applicantDescription = applicantDescription;
    }

    public ObstacleStatus getStatus() {
        return status;
    }

    public void setStatus(ObstacleStatus status) {
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

    // Constructors
    public ObstacleDTO() {
    }

    public ObstacleDTO(Long userId, Long taskId, LocalDate fromDate, LocalDate toDate,
                       String applicantDescription, ObstacleStatus status, String recipientAnswer,
                       Long recipientUserId) {
        this.userId = userId;
        this.taskId = taskId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.applicantDescription = applicantDescription;
        this.status = status;
        this.recipientAnswer = recipientAnswer;
        this.recipientUserId = recipientUserId;
    }
}

