package org.verduttio.dominicanappbackend.dto.user.scheduleInfo;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

public class UserTasksScheduleInfoWeeklyByAllDays {
    private Long userId;
    private String userName;
    private List<String> assignedTasks;
    private Map<DayOfWeek, List<UserTaskScheduleInfo>> userTasksScheduleInfo;

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

    public Map<DayOfWeek, List<UserTaskScheduleInfo>> getUserTasksScheduleInfo() {
        return userTasksScheduleInfo;
    }

    public void setUserTasksScheduleInfo(Map<DayOfWeek, List<UserTaskScheduleInfo>> userTaskScheduleInfo) {
        this.userTasksScheduleInfo = userTaskScheduleInfo;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UserTasksScheduleInfoWeeklyByAllDays(Long userId, String userName, List<String> assignedTasks, Map<DayOfWeek, List<UserTaskScheduleInfo>> userTaskScheduleInfo) {
        this.userId = userId;
        this.userName = userName;
        this.assignedTasks = assignedTasks;
        this.userTasksScheduleInfo = userTaskScheduleInfo;
    }

    public UserTasksScheduleInfoWeeklyByAllDays() {
    }
}
