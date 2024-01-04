package org.verduttio.dominicanappbackend.dto;

import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;

import java.time.LocalDate;

public class ObstacleRequestDTO {
    private Long userId;
    private Long taskId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String applicantDescription;

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

    // Constructors
    public ObstacleRequestDTO() {
    }

    public ObstacleRequestDTO(Long userId, Long taskId, LocalDate fromDate, LocalDate toDate,
                       String applicantDescription) {
        this.userId = userId;
        this.taskId = taskId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.applicantDescription = applicantDescription;
    }

    public Obstacle toObstacle() {
        Obstacle obstacle = new Obstacle();

        obstacle.setUser(new User());
        obstacle.getUser().setId(this.userId);

        obstacle.setTask(new Task());
        obstacle.getTask().setId(this.taskId);

        obstacle.setFromDate(this.fromDate);
        obstacle.setToDate(this.toDate);
        obstacle.setApplicantDescription(this.applicantDescription);
        obstacle.setStatus(ObstacleStatus.AWAITING);
        return obstacle;
    }
}
