package org.verduttio.dominicanappbackend.dto.user;

import org.verduttio.dominicanappbackend.entity.Task;

import java.time.LocalDate;

public class UserTaskStatistic {
    private final Task task;
    private final LocalDate lastAssignmentDate;
    private final long occurrencesFromStatsDate;
    private final long occurrencesAllTime;

    private UserTaskStatistic(Builder builder) {
        this.task = builder.task;
        this.lastAssignmentDate = builder.lastAssignmentDate;
        this.occurrencesFromStatsDate = builder.occurrencesFromStatsDate;
        this.occurrencesAllTime = builder.occurrencesAllTime;
    }

    public long calculateNormalizedOccurrencesFromStatsDate() {
        return calculateNormalizedOccurrences(occurrencesFromStatsDate);
    }

    public long calculateNormalizedOccurrencesAllTime() {
        return calculateNormalizedOccurrences(occurrencesAllTime);
    }

    private long calculateNormalizedOccurrences(long occurrences) {
        if (task.getSupervisorRole().isWeeklyScheduleCreatorDefault()) {
            return occurrences / task.getDaysOfWeek().size();
        } else {
            return occurrences;
        }
    }

    // Getters
    public Task getTask() {
        return task;
    }

    public LocalDate getLastAssignmentDate() {
        return lastAssignmentDate;
    }

    public long getOccurrencesFromStatsDate() {
        return occurrencesFromStatsDate;
    }

    public long getOccurrencesAllTime() {
        return occurrencesAllTime;
    }

    public static class Builder {
        private final Task task;
        private LocalDate lastAssignmentDate;
        private long occurrencesFromStatsDate;
        private long occurrencesAllTime;

        public Builder(Task task) {
            this.task = task;
        }

        public Builder lastAssignmentDate(LocalDate date) {
            this.lastAssignmentDate = date;
            return this;
        }

        public Builder occurrencesFromStatsDate(long occurrences) {
            this.occurrencesFromStatsDate = occurrences;
            return this;
        }

        public Builder occurrencesAllTime(long occurrences) {
            this.occurrencesAllTime = occurrences;
            return this;
        }

        public UserTaskStatistic build() {
            return new UserTaskStatistic(this);
        }
    }
}

