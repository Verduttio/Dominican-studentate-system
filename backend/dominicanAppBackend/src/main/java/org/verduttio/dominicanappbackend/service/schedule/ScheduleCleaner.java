package org.verduttio.dominicanappbackend.service.schedule;

import java.time.LocalDate;

public interface ScheduleCleaner {
    void cleanSchedule(Long roleId,  LocalDate startDate, LocalDate endDate);
}
