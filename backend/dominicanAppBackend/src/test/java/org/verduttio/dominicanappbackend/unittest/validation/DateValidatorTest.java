package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.verduttio.dominicanappbackend.validation.DateValidator;

import java.time.LocalDate;

class DateValidatorTest {

    private final DateValidator dateValidator = new DateValidator();

    @Test
    void ensureFromDateNotAfterToDate_WhenValid_ShouldPass() {
        LocalDate fromDate = LocalDate.of(2022, 1, 1);
        LocalDate toDate = LocalDate.of(2022, 1, 2);

        Assertions.assertDoesNotThrow(() -> dateValidator.ensureFromDateNotAfterToDate(fromDate, toDate));
    }

    @Test
    void ensureFromDateNotAfterToDate_WhenInvalid_ShouldThrowException() {
        LocalDate fromDate = LocalDate.of(2022, 1, 3);
        LocalDate toDate = LocalDate.of(2022, 1, 2);

        Assertions.assertThrows(IllegalArgumentException.class,
                () -> dateValidator.ensureFromDateNotAfterToDate(fromDate, toDate));
    }

    @Test
    void isDateInRange_WhenInRange_ShouldReturnTrue() {
        LocalDate date = LocalDate.of(2022, 1, 2);
        LocalDate fromDate = LocalDate.of(2022, 1, 1);
        LocalDate toDate = LocalDate.of(2022, 1, 3);

        Assertions.assertTrue(dateValidator.isDateInRange(date, fromDate, toDate));
    }

    @Test
    void isDateInRange_WhenOutOfRange_ShouldReturnFalse() {
        LocalDate date = LocalDate.of(2022, 1, 4);
        LocalDate fromDate = LocalDate.of(2022, 1, 1);
        LocalDate toDate = LocalDate.of(2022, 1, 3);

        Assertions.assertFalse(dateValidator.isDateInRange(date, fromDate, toDate));
    }
}
