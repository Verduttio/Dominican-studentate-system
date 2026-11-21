package org.verduttio.dominicanappbackend.dto.wish;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WishCreateDTO(
        @NotBlank String recipient,
        String email,
        @NotNull Boolean letter
) {}