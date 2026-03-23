package org.verduttio.dominicanappbackend.dto.user;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class UserSchedulesOnDaysWithSectionsDTO {
    private UserShortInfo userShortInfo;

    // Klucze: Data -> Nazwa Sekcji -> Lista przypisanych oficjów
    // (Pusty string "" oznacza zadania bez określonej pory dnia)
    private Map<LocalDate, Map<String, List<String>>> schedules;

    public UserShortInfo getUserShortInfo() {
        return userShortInfo;
    }

    public void setUserShortInfo(UserShortInfo userShortInfo) {
        this.userShortInfo = userShortInfo;
    }

    public Map<LocalDate, Map<String, List<String>>> getSchedules() {
        return schedules;
    }

    public void setSchedules(Map<LocalDate, Map<String, List<String>>> schedules) {
        this.schedules = schedules;
    }
}