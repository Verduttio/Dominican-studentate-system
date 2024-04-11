package org.verduttio.dominicanappbackend.dto.user.scheduleInfo;

import java.util.List;

public class UserTasksScheduleInfoWeekly {
    private Long userId;
    private String userName;
    private List<String> assignedTasks;
    private List<UserTaskScheduleInfo> userTasksScheduleInfo;

    // Getters i Setters
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<String> getAssignedTasks() {
        return assignedTasks;
    }

    public void setAssignedTasks(List<String> assignedTasks) {
        this.assignedTasks = assignedTasks;
    }

    public List<UserTaskScheduleInfo> getUserTasksScheduleInfo() {
        return userTasksScheduleInfo;
    }

    public void setUserTasksScheduleInfo(List<UserTaskScheduleInfo> userTaskScheduleInfo) {
        this.userTasksScheduleInfo = userTaskScheduleInfo;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UserTasksScheduleInfoWeekly(Long userId, String userName, List<String> assignedTasks, List<UserTaskScheduleInfo> userTaskScheduleInfo) {
        this.userId = userId;
        this.userName = userName;
        this.assignedTasks = assignedTasks;
        this.userTasksScheduleInfo = userTaskScheduleInfo;
    }

    public UserTasksScheduleInfoWeekly() {
    }
}
