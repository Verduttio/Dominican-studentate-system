package org.verduttio.dominicanappbackend.dto.user.scheduleInfo;

public class UserTaskScheduleInfo {
    private String taskName;
    private Long taskId;
    private int lastAssignedWeeksAgo;
    private int numberOfWeeklyAssignsFromStatsDate;
    private boolean hasRoleForTheTask;
    private boolean isInConflict;
    private boolean hasObstacle;
    private boolean assignedToTheTask;

    // Getters i Setters
    public int getLastAssignedWeeksAgo() {
        return lastAssignedWeeksAgo;
    }

    public void setLastAssignedWeeksAgo(int lastAssignedWeeksAgo) {
        this.lastAssignedWeeksAgo = lastAssignedWeeksAgo;
    }

    public int getNumberOfWeeklyAssignsFromStatsDate() {
        return numberOfWeeklyAssignsFromStatsDate;
    }

    public void setNumberOfWeeklyAssignsFromStatsDate(int numberOfWeeklyAssignsFromStatsDate) {
        this.numberOfWeeklyAssignsFromStatsDate = numberOfWeeklyAssignsFromStatsDate;
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

    public UserTaskScheduleInfo(String taskName, Long taskId, int lastAssignedWeeksAgo, int numberOfWeeklyAssignsFromStatsDate, boolean hasRoleForTheTask, boolean isInConflict, boolean hasObstacle, boolean assignedToTheTask) {
        this.taskName = taskName;
        this.taskId = taskId;
        this.lastAssignedWeeksAgo = lastAssignedWeeksAgo;
        this.numberOfWeeklyAssignsFromStatsDate = numberOfWeeklyAssignsFromStatsDate;
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
