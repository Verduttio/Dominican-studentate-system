package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.dean.PocketMoneyResponseDTO;
import org.verduttio.dominicanappbackend.service.dean.PocketMoneyService;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dean")
// Upewnij się, że nazwa roli w bazie to "ROLE_DZIEKAN" lub "Dziekan" (Spring często wymaga prefiksu ROLE_)
// Jeśli Twoja rola w bazie nazywa się po prostu "Dziekan", spróbuj: hasAuthority('Dziekan')
@PreAuthorize("hasAnyAuthority('ROLE_DZIEKAN', 'Dziekan')")
public class DeanController {

    private final PocketMoneyService pocketMoneyService;

    @Autowired
    public DeanController(PocketMoneyService pocketMoneyService) {
        this.pocketMoneyService = pocketMoneyService;
    }

    // 1. Pobierz tabelkę kieszonkowego dla danego miesiąca
    // GET /api/dean/pocket-money?month=1
    @GetMapping("/pocket-money")
    public ResponseEntity<PocketMoneyResponseDTO> getPocketMoneySummary(
            @RequestParam(name = "month", required = false) Integer month) {

        // Jeśli nie podano miesiąca, bierzemy obecny
        int targetMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        return ResponseEntity.ok(pocketMoneyService.calculatePocketMoney(targetMonth));
    }

    // 2. Pobierz aktualne stawki (żeby wypełnić inputy pod tabelą)
    // GET /api/dean/pocket-money/rates
    @GetMapping("/pocket-money/rates")
    public ResponseEntity<Map<String, Integer>> getCurrentRates() {
        return ResponseEntity.ok(pocketMoneyService.getCurrentRates());
    }

    // 3. Zaktualizuj stawki
    // POST /api/dean/pocket-money/rates?pocketMoney=120&namedayMoney=60
    @PostMapping("/pocket-money/rates")
    public ResponseEntity<Void> updateRates(
            @RequestParam("pocketMoney") int pocketMoney,
            @RequestParam("namedayMoney") int namedayMoney) {

        pocketMoneyService.updateRates(pocketMoney, namedayMoney);
        return ResponseEntity.ok().build();
    }
}