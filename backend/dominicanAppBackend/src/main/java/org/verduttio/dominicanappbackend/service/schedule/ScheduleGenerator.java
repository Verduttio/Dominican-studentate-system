package org.verduttio.dominicanappbackend.service.schedule;

import java.time.LocalDate;

public interface ScheduleGenerator {
    void generateSchedule(Long roleId, Long startingFromUserId, LocalDate startDate, LocalDate endDate);
}
