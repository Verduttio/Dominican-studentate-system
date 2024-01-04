package org.verduttio.dominicanappbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "obstacles")
public class Obstacle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    private LocalDate fromDate;

    private LocalDate toDate;

    private String applicantDescription;

    @Enumerated(EnumType.STRING)
    private ObstacleStatus status;

    private String recipientAnswer;

    @ManyToOne
    @JoinColumn(name = "recipient_user_id")
    private User recipientUser;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
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

    public User getRecipientUser() {
        return recipientUser;
    }

    public void setRecipientUser(User recipientUser) {
        this.recipientUser = recipientUser;
    }

    // Constructors
    public Obstacle() {
    }

    public Obstacle(User user, Task task, LocalDate fromDate, LocalDate toDate,
                    String applicantDescription, ObstacleStatus status, String recipientAnswer,
                    User recipientUser) {
        this.user = user;
        this.task = task;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.applicantDescription = applicantDescription;
        this.status = status;
        this.recipientAnswer = recipientAnswer;
        this.recipientUser = recipientUser;
    }
}
