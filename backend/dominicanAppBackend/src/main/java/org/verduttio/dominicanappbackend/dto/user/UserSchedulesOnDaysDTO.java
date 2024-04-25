package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class UserSchedulesOnDaysDTO {
    private UserShortInfo userShortInfo;
    private Map<LocalDate, List<String>> schedules;

    public UserSchedulesOnDaysDTO(UserShortInfo userShortInfo, Map<LocalDate, List<String>> schedules) {
        this.userShortInfo = userShortInfo;
        this.schedules = schedules;
    }

    public UserShortInfo getUserShortInfo() {
        return userShortInfo;
    }

    public Map<LocalDate, List<String>> getSchedules() {
        return schedules;
    }

    public void setUserShortInfo(UserShortInfo userShortInfo) {
        this.userShortInfo = userShortInfo;
    }

    public void setSchedules(Map<LocalDate, List<String>> schedules) {
        this.schedules = schedules;
    }

    public UserSchedulesOnDaysDTO() {
    }
}
