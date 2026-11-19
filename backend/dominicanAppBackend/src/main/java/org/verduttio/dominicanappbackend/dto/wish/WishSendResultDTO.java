package org.verduttio.dominicanappbackend.dto.wish;

import java.util.List;

public record WishSendResultDTO(
        boolean testMode,
        int total,
        int succeeded,
        List<ItemError> errors
) {
    public record ItemError(
            Long wishId,
            String recipient,
            String error
    ) {}
}