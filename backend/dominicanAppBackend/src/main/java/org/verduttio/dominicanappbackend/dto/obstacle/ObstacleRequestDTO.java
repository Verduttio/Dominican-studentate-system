package org.verduttio.dominicanappbackend.dto.obstacle;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.verduttio.dominicanappbackend.domain.obstacle.Obstacle;
import org.verduttio.dominicanappbackend.domain.ObstacleStatus;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.domain.User;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class ObstacleRequestDTO {
    @NotNull(message="User id is mandatory")
    private Long userId;
    @NotEmpty(message="Task id is mandatory")
    private Set<Long> tasksIds;
    @NotNull(message="From date is mandatory")
    private LocalDate fromDate;
    @NotNull(message="To date is mandatory")
    private LocalDate toDate;
    private String applicantDescription;

    // Getters and setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Set<Long> getTasksIds() {
        return tasksIds;
    }

    public void setTasksIds(Set<Long> tasksIds) {
        this.tasksIds = tasksIds;
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

    public ObstacleRequestDTO(Long userId, Set<Long> tasksIds, LocalDate fromDate, LocalDate toDate,
                       String applicantDescription) {
        this.userId = userId;
        this.tasksIds = tasksIds;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.applicantDescription = applicantDescription;
    }

    public Obstacle toObstacle() {
        Obstacle obstacle = new Obstacle();

        obstacle.setUser(new User());
        obstacle.getUser().setId(this.userId);

        obstacle.setTasks(new HashSet<>());

        for (Long taskId : this.tasksIds) {
            Task task = new Task();
            task.setId(taskId);
            obstacle.getTasks().add(task);
        }

        obstacle.setFromDate(this.fromDate);
        obstacle.setToDate(this.toDate);
        obstacle.setApplicantDescription(this.applicantDescription);
        obstacle.setStatus(ObstacleStatus.AWAITING);
        return obstacle;
    }
}
