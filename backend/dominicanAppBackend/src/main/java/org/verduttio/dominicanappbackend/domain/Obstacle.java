package org.verduttio.dominicanappbackend.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "obstacles")
public class Obstacle {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "obstacle_id_generator")
    @SequenceGenerator(name="obstacle_id_generator", sequenceName = "obstacle_id_seq", allocationSize=1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany
    @JoinTable(
            name = "obstacle_tasks",
            joinColumns = @JoinColumn(name = "obstacle_id"),
            inverseJoinColumns = @JoinColumn(name = "task_id")
    )
    private Set<Task> tasks;

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

    public Set<Task> getTasks() {
        return tasks;
    }

    public void setTasks(Set<Task> tasks) {
        this.tasks = tasks;
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

    public Obstacle(User user, Set<Task> tasks, LocalDate fromDate, LocalDate toDate,
                    String applicantDescription, ObstacleStatus status, String recipientAnswer,
                    User recipientUser) {
        this.user = user;
        this.tasks = tasks;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.applicantDescription = applicantDescription;
        this.status = status;
        this.recipientAnswer = recipientAnswer;
        this.recipientUser = recipientUser;
    }
}
