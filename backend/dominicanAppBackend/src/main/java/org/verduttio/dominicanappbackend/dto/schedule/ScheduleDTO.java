package org.verduttio.dominicanappbackend.dto.schedule;

import jakarta.validation.constraints.NotNull;
import org.verduttio.dominicanappbackend.entity.Schedule;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.entity.User;

import java.time.LocalDate;

public class ScheduleDTO {
    @NotNull(message="Task id is mandatory")
    private Long taskId;
    @NotNull(message="User id is mandatory")
    private Long userId;
    @NotNull(message="Date is mandatory")
    private LocalDate date;

    // Getters and setters
    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Constructors
    public ScheduleDTO() {
    }

    public ScheduleDTO(Long taskId, Long userId, LocalDate date) {
        this.taskId = taskId;
        this.userId = userId;
        this.date = date;
    }

    public Schedule toSchedule() {
        Schedule schedule = new Schedule();

        Task task = new Task();
        task.setId(this.taskId);
        schedule.setTask(task);

        User user = new User();
        user.setId(this.userId);
        schedule.setUser(user);

        schedule.setDate(this.date);

        return schedule;
    }
}
