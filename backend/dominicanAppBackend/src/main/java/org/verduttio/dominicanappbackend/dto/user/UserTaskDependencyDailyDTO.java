package org.verduttio.dominicanappbackend.dto.user;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class UserTaskDependencyDailyDTO {
    private Long userId;
    private String userName;
    private LocalDate lastAssigned;
    private int numberOfAssignsInLastYear;
    private List<String> assignedTasks;
    private Set<DayOfWeek> isInConflict;
    private Set<DayOfWeek> hasObstacle;
    private Set<DayOfWeek> assignedToTheTask;

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

    public Set<DayOfWeek> getIsInConflict() {
        return isInConflict;
    }

    public void setIsInConflict(Set<DayOfWeek> isInConflict) {
        this.isInConflict = isInConflict;
    }

    public Set<DayOfWeek> getHasObstacle() {
        return hasObstacle;
    }

    public void setHasObstacle(Set<DayOfWeek> hasObstacle) {
        this.hasObstacle = hasObstacle;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UserTaskDependencyDailyDTO(Long userId, String userName, LocalDate lastAssigned, int numberOfAssignsInLastYear,
                                 List<String> assignedTasks, Set<DayOfWeek> isInConflict, Set<DayOfWeek> hasObstacle, Set<DayOfWeek> assignedToTheTask) {
        this.userId = userId;
        this.userName = userName;
        this.lastAssigned = lastAssigned;
        this.numberOfAssignsInLastYear = numberOfAssignsInLastYear;
        this.assignedTasks = assignedTasks;
        this.isInConflict = isInConflict;
        this.hasObstacle = hasObstacle;
        this.assignedToTheTask = assignedToTheTask;
    }

    public Set<DayOfWeek> getAssignedToTheTask() {
        return assignedToTheTask;
    }

    public void setAssignedToTheTask(Set<DayOfWeek> assignedToTheTask) {
        this.assignedToTheTask = assignedToTheTask;
    }
}
