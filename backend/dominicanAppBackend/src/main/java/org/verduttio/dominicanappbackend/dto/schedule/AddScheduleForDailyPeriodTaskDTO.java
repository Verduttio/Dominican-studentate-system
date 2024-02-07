package org.verduttio.dominicanappbackend.dto.schedule;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class AddScheduleForDailyPeriodTaskDTO {
    @NotNull(message="Task id is mandatory")
    private Long taskId;
    @NotNull(message="User id is mandatory")
    private Long userId;
    @NotNull(message="Start date of week is mandatory")
    private LocalDate weekStartDate;
    @NotNull(message="End date of week is mandatory")
    private LocalDate weekEndDate;
    @NotNull(message="Task date is mandatory")
    private LocalDate taskDate;

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

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public LocalDate getWeekEndDate() {
        return weekEndDate;
    }

    public void setWeekEndDate(LocalDate weekEndDate) {
        this.weekEndDate = weekEndDate;
    }

    public LocalDate getTaskDate() {
        return taskDate;
    }

    public void setTaskDate(LocalDate taskDate) {
        this.taskDate = taskDate;
    }

    // Constructors

    public AddScheduleForDailyPeriodTaskDTO() {
    }

    public AddScheduleForDailyPeriodTaskDTO(Long taskId, Long userId, LocalDate weekStartDate, LocalDate weekEndDate, LocalDate taskDate) {
        this.taskId = taskId;
        this.userId = userId;
        this.weekStartDate = weekStartDate;
        this.weekEndDate = weekEndDate;
        this.taskDate = taskDate;
    }
}
