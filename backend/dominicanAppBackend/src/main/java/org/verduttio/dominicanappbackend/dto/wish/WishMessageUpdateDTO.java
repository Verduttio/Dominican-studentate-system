package org.verduttio.dominicanappbackend.dto.wish;

import jakarta.validation.constraints.NotNull;

public record WishMessageUpdateDTO(
        @NotNull String message
) {}