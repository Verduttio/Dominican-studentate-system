package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;
import java.util.List;

public class UserTaskDependencyWeeklyDTO {
    private Long userId;
    private String userName;
    private LocalDate lastAssigned;
    private int numberOfAssignsInLastYear;
    private List<String> assignedTasks;
    private boolean isInConflict;
    private boolean hasObstacle;
    private boolean assignedToTheTask;

    // Getters i Setters
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

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

    public List<String> getAssignedTasks() {
        return assignedTasks;
    }

    public void setAssignedTasks(List<String> assignedTasks) {
        this.assignedTasks = assignedTasks;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UserTaskDependencyWeeklyDTO(Long userId, String userName, LocalDate lastAssigned, int numberOfAssignsInLastYear,
                                 List<String> assignedTasks, boolean isInConflict, boolean hasObstacle, boolean assignedToTheTask) {
        this.userId = userId;
        this.userName = userName;
        this.lastAssigned = lastAssigned;
        this.numberOfAssignsInLastYear = numberOfAssignsInLastYear;
        this.assignedTasks = assignedTasks;
        this.isInConflict = isInConflict;
        this.hasObstacle = hasObstacle;
        this.assignedToTheTask = assignedToTheTask;
    }

    public boolean isAssignedToTheTask() {
        return assignedToTheTask;
    }

    public void setAssignedToTheTask(boolean assignedToTheTask) {
        this.assignedToTheTask = assignedToTheTask;
    }
}
