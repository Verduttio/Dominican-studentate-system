package org.verduttio.dominicanappbackend.dto.user.scheduleInfo;

import java.time.LocalDate;

public class UserTaskScheduleInfo {
    private String taskName;
    private Long taskId;
    private LocalDate lastAssigned;
    private int numberOfAssignsInLastYear;
    private boolean hasRoleForTheTask;
    private boolean isInConflict;
    private boolean hasObstacle;
    private boolean assignedToTheTask;

    // Getters i Setters
    public LocalDate getLastAssigned() {
        return lastAssigned;
    }

    public void setLastAssigned(LocalDate lastAssigned) {
        this.lastAssigned = lastAssigned;
    }

    public int getNumberOfAssignsInLastYear() {
        return numberOfAssignsInLastYear;
    }

    public void setNumberOfAssignsInLastYear(int numberOfAssignsInLastYear) {
        this.numberOfAssignsInLastYear = numberOfAssignsInLastYear;
    }

    public boolean getHasRoleForTheTask() {
        return hasRoleForTheTask;
    }

    public void setHasRoleForTheTask(boolean hasRoleForTheTask) {
        this.hasRoleForTheTask = hasRoleForTheTask;
    }

    public boolean getIsInConflict() {
        return isInConflict;
    }

    public void setIsInConflict(boolean isInConflict) {
        this.isInConflict = isInConflict;
    }

    public boolean getHasObstacle() {
        return hasObstacle;
    }

    public void setHasObstacle(boolean hasObstacle) {
        this.hasObstacle = hasObstacle;
    }

    public boolean getAssignedToTheTask() {
        return assignedToTheTask;
    }

    public void setAssignedToTheTask(boolean assignedToTheTask) {
        this.assignedToTheTask = assignedToTheTask;
    }

    public UserTaskScheduleInfo(String taskName, Long taskId, LocalDate lastAssigned, int numberOfAssignsInLastYear, boolean hasRoleForTheTask, boolean isInConflict, boolean hasObstacle, boolean assignedToTheTask) {
        this.taskName = taskName;
        this.taskId = taskId;
        this.lastAssigned = lastAssigned;
        this.numberOfAssignsInLastYear = numberOfAssignsInLastYear;
        this.hasRoleForTheTask = hasRoleForTheTask;
        this.isInConflict = isInConflict;
        this.hasObstacle = hasObstacle;
        this.assignedToTheTask = assignedToTheTask;
    }

    public UserTaskScheduleInfo() {
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
}
