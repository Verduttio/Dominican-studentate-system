package org.verduttio.dominicanappbackend.dto.schedule;

import jakarta.validation.constraints.NotNull;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.domain.TaskSection;
import org.verduttio.dominicanappbackend.domain.User;

import java.time.LocalDate;

public class ScheduleDTO {
    @NotNull(message="Task id is mandatory")
    private Long taskId;
    @NotNull(message="User id is mandatory")
    private Long userId;
    @NotNull(message="Date is mandatory")
    private LocalDate date;

    private Long taskSectionId;

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

    public Long getTaskSectionId() { return taskSectionId; }
    public void setTaskSectionId(Long taskSectionId) { this.taskSectionId = taskSectionId; }

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

        if (this.taskSectionId != null) {
            TaskSection section = new TaskSection();
            section.setId(this.taskSectionId);
            schedule.setTaskSection(section);
        }

        return schedule;
    }
}
