package org.verduttio.dominicanappbackend.dto.dean;

public record PocketMoneySummaryDTO(
        String romanYear,       // "I", "II" itd.
        long brotherCount,      // Liczba braci na roku
        long pocketMoneyTotal,  // Suma kieszonkowego
        long namedayCount,      // Liczba imienin w miesiącu
        long namedayMoneyTotal, // Suma imieninowego
        long rowTotal           // Łącznie dla rocznika
) {}