package org.verduttio.dominicanappbackend.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateUtils {
    public static String PL_DATE_FORMAT = "dd.MM.yyyy";

    public static DateTimeFormatter getPlDateFormatter() {
        return DateTimeFormatter.ofPattern(PL_DATE_FORMAT);
    }

    public static String getDayMonthFormat(LocalDate date) {
        return getPlDateFormatter().format(date).substring(0, 5);
    }

    public static String getDayOfWeekPL(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "Pon";
            case TUESDAY -> "Wt";
            case WEDNESDAY -> "Sr";
            case THURSDAY -> "Czw";
            case FRIDAY -> "Pt";
            case SATURDAY -> "Sob";
            case SUNDAY -> "Niedz";
            default -> "";
        };
    }
}
