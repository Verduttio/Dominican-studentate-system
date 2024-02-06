package org.verduttio.dominicanappbackend.unittest.validation;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.verduttio.dominicanappbackend.validation.DateValidator;

import java.time.LocalDate;

class DateValidatorTest {
    @Test
    void ensureFromDateNotAfterToDate_WhenValid_ShouldPass() {
        LocalDate fromDate = LocalDate.of(2022, 1, 1);
        LocalDate toDate = LocalDate.of(2022, 1, 2);

        Assertions.assertDoesNotThrow(() -> DateValidator.ensureFromDateNotAfterToDate(fromDate, toDate));
    }

    @Test
    void ensureFromDateNotAfterToDate_WhenInvalid_ShouldThrowException() {
        LocalDate fromDate = LocalDate.of(2022, 1, 3);
        LocalDate toDate = LocalDate.of(2022, 1, 2);

        Assertions.assertThrows(IllegalArgumentException.class,
                () -> DateValidator.ensureFromDateNotAfterToDate(fromDate, toDate));
    }

    @Test
    void isDateInRange_WhenInRange_ShouldReturnTrue() {
        LocalDate date = LocalDate.of(2022, 1, 2);
        LocalDate fromDate = LocalDate.of(2022, 1, 1);
        LocalDate toDate = LocalDate.of(2022, 1, 3);

        Assertions.assertTrue(DateValidator.isDateInRange(date, fromDate, toDate));
    }

    @Test
    void isDateInRange_WhenOutOfRange_ShouldReturnFalse() {
        LocalDate date = LocalDate.of(2022, 1, 4);
        LocalDate fromDate = LocalDate.of(2022, 1, 1);
        LocalDate toDate = LocalDate.of(2022, 1, 3);

        Assertions.assertFalse(DateValidator.isDateInRange(date, fromDate, toDate));
    }
}
