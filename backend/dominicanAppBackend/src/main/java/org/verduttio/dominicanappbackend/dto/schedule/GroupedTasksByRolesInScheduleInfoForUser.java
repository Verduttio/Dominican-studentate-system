package org.verduttio.dominicanappbackend.dto.schedule;

import java.util.List;
import java.util.Map;

public record GroupedTasksByRolesInScheduleInfoForUser(Long userId, String userName, String userSurname, Map<String, List<String>> groupedTasksInfoStrings) {
}
