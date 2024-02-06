package org.verduttio.dominicanappbackend.dto.schedule;

import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class AddScheduleForWholePeriodTaskDTO {
    @NotNull(message="Task id is mandatory")
    private Long taskId;
    @NotNull(message="User id is mandatory")
    private Long userId;
    @NotNull(message="From date is mandatory")
    private LocalDate fromDate;
    @NotNull(message="To date is mandatory")
    private LocalDate toDate;

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

    // Constructors
    public AddScheduleForWholePeriodTaskDTO() {
    }

    public AddScheduleForWholePeriodTaskDTO(Long taskId, Long userId, LocalDate fromDate, LocalDate toDate) {
        this.taskId = taskId;
        this.userId = userId;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

    @Override
    public String toString() {
        return "AddScheduleForWholePeriodTaskDTO{" +
                "taskId=" + taskId +
                ", userId=" + userId +
                ", fromDate=" + fromDate +
                ", toDate=" + toDate +
                '}';
    }
}
