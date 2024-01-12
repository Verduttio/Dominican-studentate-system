package org.verduttio.dominicanappbackend.validation;

import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DateValidator {

    public void ensureFromDateNotAfterToDate(LocalDate fromDate, LocalDate toDate) {
        if (!(fromDate.isBefore(toDate) || fromDate.isEqual(toDate))) {
            throw new IllegalArgumentException("Invalid dates. 'fromDate' must be before or equal to 'toDate'");
        }
    }

    public boolean isDateInRange(LocalDate date, LocalDate fromDate, LocalDate toDate) {
        return (date.isAfter(fromDate) || date.isEqual(fromDate)) && (date.isBefore(toDate) || date.isEqual(toDate));
    }
}
