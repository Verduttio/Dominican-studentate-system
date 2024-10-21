package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;

public class UserTaskStatisticsDTO {
    private String taskName;
    private String taskAbbrev;
    private LocalDate lastAssignmentDate;
    private long normalizedOccurrencesFromStatsDate;
    private long normalizedOccurrencesAllTime;

    public UserTaskStatisticsDTO(UserTaskStatistic statistic) {
        this.taskName = statistic.getTask().getName();
        this.taskAbbrev = statistic.getTask().getNameAbbrev();
        this.lastAssignmentDate = statistic.getLastAssignmentDate();
        this.normalizedOccurrencesFromStatsDate = statistic.calculateNormalizedOccurrencesFromStatsDate();
        this.normalizedOccurrencesAllTime = statistic.calculateNormalizedOccurrencesAllTime();
    }

    public UserTaskStatisticsDTO() {}

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getTaskAbbrev() {
        return taskAbbrev;
    }

    public void setTaskAbbrev(String taskAbbrev) {
        this.taskAbbrev = taskAbbrev;
    }

    public LocalDate getLastAssignmentDate() {
        return lastAssignmentDate;
    }

    public void setLastAssignmentDate(LocalDate lastAssignmentDate) {
        this.lastAssignmentDate = lastAssignmentDate;
    }

    public long getNormalizedOccurrencesFromStatsDate() {
        return normalizedOccurrencesFromStatsDate;
    }

    public void setNormalizedOccurrencesFromStatsDate(long normalizedOccurrencesFromStatsDate) {
        this.normalizedOccurrencesFromStatsDate = normalizedOccurrencesFromStatsDate;
    }

    public long getNormalizedOccurrencesAllTime() {
        return normalizedOccurrencesAllTime;
    }

    public void setNormalizedOccurrencesAllTime(long normalizedOccurrencesAllTime) {
        this.normalizedOccurrencesAllTime = normalizedOccurrencesAllTime;
    }

}
