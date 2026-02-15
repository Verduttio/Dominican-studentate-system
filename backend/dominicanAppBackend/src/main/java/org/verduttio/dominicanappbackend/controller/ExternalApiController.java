package org.verduttio.dominicanappbackend.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.Schedule;
import org.verduttio.dominicanappbackend.repository.ScheduleRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/external")
public class ExternalApiController {

    private final ScheduleRepository scheduleRepository;

    // Prosty klucz "na sztywno" do zabezpieczenia przed przypadkowym wejściem
    private static final String API_KEY = "TajneHasloGAS";

    public ExternalApiController(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @GetMapping("/task-emails")
    public ResponseEntity<?> getEmailsForTask(
            @RequestParam Long taskId,
            @RequestParam String key
    ) {
        if (!API_KEY.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Pobieramy dyżury na DZIŚ dla konkretnego ID zadania
        List<Schedule> schedules = scheduleRepository.findAllByDateAndTaskId(LocalDate.now(), taskId);

        // Wyciągamy same maile (unikalne)
        List<String> emails = schedules.stream()
                .map(s -> s.getUser().getEmail())
                .filter(email -> email != null && !email.isBlank())
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(emails);
    }
}