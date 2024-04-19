package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;

public record UserTaskStatisticsDTO(
        String taskName, String taskNameAbbrev, LocalDate lastAssigned, long numberOfAssignsFromStatsDate, long totalNumberOfAssigns) {
}
