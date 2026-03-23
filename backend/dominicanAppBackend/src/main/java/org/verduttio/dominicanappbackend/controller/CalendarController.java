package org.verduttio.dominicanappbackend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.UserRepository; // <--- DODAJ IMPORT
import org.verduttio.dominicanappbackend.service.CalendarService;

import java.security.Principal; // <--- DODAJ IMPORT
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService calendarService;
    private final UserRepository userRepository; // <--- DODAJ POLE

    // ZAKTUALIZUJ KONSTRUKTOR
    public CalendarController(CalendarService calendarService, UserRepository userRepository) {
        this.calendarService = calendarService;
        this.userRepository = userRepository;
    }

    // 1. PUBLICZNY: Google Calendar tu uderza (bez zmian)
    @GetMapping(value = "/ics/{token}", produces = "text/calendar")
    public ResponseEntity<String> getUserCalendar(@PathVariable String token) {
        try {
            String icsData = calendarService.generateIcsForToken(token);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dyzury.ics\"")
                    .contentType(MediaType.parseMediaType("text/calendar"))
                    .body(icsData);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 2. PRYWATNY: Frontend pyta "Jaki jest mój link?"
    // ZMIANA: Zamiast @AuthenticationPrincipal używamy Principal
    @GetMapping("/my-link")
    public ResponseEntity<Map<String, String>> getMyCalendarLink(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        // Pobieramy login/email z kontekstu security
        String emailOrUsername = principal.getName();

        // Szukamy użytkownika w bazie (to jest najbezpieczniejsze)
        User user = userRepository.findByEmail(emailOrUsername)
                .orElseThrow(() -> new RuntimeException("Logged in user not found in DB"));

        String token = calendarService.getEncryptedTokenForUser(user.getId());
        return ResponseEntity.ok(Map.of("token", token));
    }
}