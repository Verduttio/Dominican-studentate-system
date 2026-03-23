package org.verduttio.dominicanappbackend.dto;

import java.time.LocalDate;
import java.util.List;

public record SpecialEventDTO(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        List<LocalDate> collectionDates
) {}