package org.verduttio.dominicanappbackend.dto.wish;

import jakarta.validation.constraints.NotBlank;

public record WishEmailUpdateDTO(
        @NotBlank String email
) {}