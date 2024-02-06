package org.verduttio.dominicanappbackend.validation;

import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class DateValidator {

    public static void ensureFromDateNotAfterToDate(LocalDate fromDate, LocalDate toDate) {
        if (!(fromDate.isBefore(toDate) || fromDate.isEqual(toDate))) {
            throw new IllegalArgumentException("Invalid dates. 'fromDate' must be before or equal to 'toDate'");
        }
    }

    public static boolean isDateInRange(LocalDate date, LocalDate fromDate, LocalDate toDate) {
        return (date.isAfter(fromDate) || date.isEqual(fromDate)) && (date.isBefore(toDate) || date.isEqual(toDate));
    }

    public static boolean dateStartsMondayEndsSunday(LocalDate from, LocalDate to) {
        return from.getDayOfWeek().equals(DayOfWeek.MONDAY) && to.getDayOfWeek().equals(DayOfWeek.SUNDAY)
                && ChronoUnit.DAYS.between(from, to) == 6;
    }
}
