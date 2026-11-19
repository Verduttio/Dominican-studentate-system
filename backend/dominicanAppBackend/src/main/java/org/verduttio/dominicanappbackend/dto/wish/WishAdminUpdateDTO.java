package org.verduttio.dominicanappbackend.dto.wish;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WishAdminUpdateDTO(
        @NotBlank String recipient,
        @NotNull Boolean letter,
        Long userId
) {}