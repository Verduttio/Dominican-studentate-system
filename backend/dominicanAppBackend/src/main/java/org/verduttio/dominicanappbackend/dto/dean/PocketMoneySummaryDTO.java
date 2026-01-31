package org.verduttio.dominicanappbackend.dto.dean;

import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;

import java.util.List;

public record PocketMoneySummaryDTO(
        String romanYear,       // "I", "II" itd.
        long brotherCount,      // Liczba braci na roku
        long pocketMoneyTotal,  // Suma kieszonkowego
        long namedayCount,      // Liczba imienin w miesiącu
        long namedayMoneyTotal, // Suma imieninowego
        long rowTotal,           // Łącznie dla rocznika
        List<UserShortInfo> brothers
) {}