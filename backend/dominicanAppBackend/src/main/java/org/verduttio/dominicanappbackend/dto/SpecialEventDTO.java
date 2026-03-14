package org.verduttio.dominicanappbackend.dto;

import java.time.LocalDate;

public record SpecialEventDTO(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate
) {}