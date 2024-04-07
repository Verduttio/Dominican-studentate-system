package org.verduttio.dominicanappbackend.validation;

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

    public static boolean dateStartsSundayEndsSaturday(LocalDate from, LocalDate to) {
        return from.getDayOfWeek().equals(DayOfWeek.SUNDAY) && to.getDayOfWeek().equals(DayOfWeek.SATURDAY)
                && ChronoUnit.DAYS.between(from, to) == 6;
    }
}
