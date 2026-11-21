package org.verduttio.dominicanappbackend.dto.wish;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WishesSettingsUpdateDTO(
        @NotBlank String title,
        @NotNull Boolean visible
) {}