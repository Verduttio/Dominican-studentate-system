package org.verduttio.dominicanappbackend.dto;

import java.time.LocalDate;

public record CloneEventRequest(
        String newName,
        LocalDate newStartDate,
        LocalDate newEndDate
) {}