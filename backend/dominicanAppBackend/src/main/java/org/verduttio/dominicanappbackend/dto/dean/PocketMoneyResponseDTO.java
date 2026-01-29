package org.verduttio.dominicanappbackend.dto.dean;

import org.verduttio.dominicanappbackend.dto.user.UserShortInfo; // Użyj istniejącego DTO do listy braci
import java.util.List;

public record PocketMoneyResponseDTO(
        List<PocketMoneySummaryDTO> tableRows,  // Wiersze tabeli (roczniki)
        List<UserShortInfo> namedayBoys,        // Lista solenizantów pod tabelą
        long totalPocketMoney,                  // Suma globalna kieszonkowego
        long totalNamedayMoney,                 // Suma globalna imieninowego
        long grandTotal                         // Suma wszystkiego
) {}