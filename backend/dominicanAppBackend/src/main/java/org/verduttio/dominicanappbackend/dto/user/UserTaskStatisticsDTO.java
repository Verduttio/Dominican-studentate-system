package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;

public record UserTaskStatisticsDTO(
        String taskName, LocalDate lastAssigned, long numberOfAssignInLast30Days,
        long numberOfAssignInLast90Days, long numberOfAssignInLast365Days, long totalNumberOfAssigns) {
}
