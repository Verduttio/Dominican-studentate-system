package org.verduttio.dominicanappbackend.dto.wish;

import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;

import java.util.List;

public record WishesPageDTO(
        String title,
        boolean visible,
        boolean admin,
        List<WishRow> wishes,
        List<UserShortInfo> users,
        List<UserStats> statistics
) {
    public record WishRow(
            Long id,
            String recipient,
            String email,
            boolean letter,
            Long userId,
            String userName,
            String message,
            Boolean sent
    ) {}

    public record UserStats(
            Long userId,
            String name,
            String surname,
            long count
    ) {}
}