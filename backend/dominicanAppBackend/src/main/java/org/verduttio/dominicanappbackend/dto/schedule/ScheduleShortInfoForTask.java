package org.verduttio.dominicanappbackend.dto.schedule;

import java.util.List;

public record ScheduleShortInfoForTask(Long taskId, String taskName, String taskAbbrev, List<String> usersInfoStrings) {
}