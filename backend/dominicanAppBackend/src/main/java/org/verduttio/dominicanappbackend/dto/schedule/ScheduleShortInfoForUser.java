package org.verduttio.dominicanappbackend.dto.schedule;

import java.util.List;

public record ScheduleShortInfoForUser(Long userId, String userName, String userSurname, List<String> tasksInfoStrings) {
}
