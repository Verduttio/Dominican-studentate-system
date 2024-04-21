package org.verduttio.dominicanappbackend.validation;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

public class DateValidator {

    public static final String isStartDateMax6daysBeforeEndDateError = "Start date must be at most 6 days before end date";

    public static void ensureFromDateNotAfterToDate(LocalDate fromDate, LocalDate toDate) {
        if (!(fromDate.isBefore(toDate) || fromDate.isEqual(toDate))) {
            throw new IllegalArgumentException("Invalid dates. 'fromDate' must be before or equal to 'toDate'");
        }
    }

    public static boolean isDateInRange(LocalDate date, LocalDate fromDate, LocalDate toDate) {
        return (date.isAfter(fromDate) || date.isEqual(fromDate)) && (date.isBefore(toDate) || date.isEqual(toDate));
    }

    public static boolean dateStartsSundayEndsSaturday(LocalDate from, LocalDate to) {
        return from.getDayOfWeek().equals(DayOfWeek.SUNDAY) && to.getDayOfWeek().equals(DayOfWeek.SATURDAY)
                && ChronoUnit.DAYS.between(from, to) == 6;
    }

    public static boolean isStartDateMax6daysBeforeEndDate(LocalDate startDate, LocalDate endDate) {
        if (!startDate.isAfter(endDate)) {
            long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
            return daysBetween < 7;
        }
        return false;
    }

    public static Map<String, LocalDate> getWeekBoundaries(LocalDate date) {
        int dayOfWeek = date.get(ChronoField.DAY_OF_WEEK);

        int daysToPreviousSunday = (dayOfWeek % 7);
        int daysToNextSaturday = 6 - (dayOfWeek % 7);

        LocalDate startWeek = date.minusDays(daysToPreviousSunday);
        LocalDate endOfWeek = date.plusDays(daysToNextSaturday);

        Map<String, LocalDate> result = new HashMap<>();
        result.put("startWeek", startWeek);
        result.put("endOfWeek", endOfWeek);

        return result;
    }
}
