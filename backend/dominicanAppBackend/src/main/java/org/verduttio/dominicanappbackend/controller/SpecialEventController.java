package org.verduttio.dominicanappbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;
import org.verduttio.dominicanappbackend.domain.Task;
import org.verduttio.dominicanappbackend.dto.CloneEventRequest;
import org.verduttio.dominicanappbackend.dto.SpecialEventDTO;
import org.verduttio.dominicanappbackend.dto.task.TaskDTO;
import org.verduttio.dominicanappbackend.service.SpecialEventService;
import org.verduttio.dominicanappbackend.service.TaskService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/special-events")
@PreAuthorize("hasAnyRole('DEAN', 'ADMIN')")
public class SpecialEventController {

    private final SpecialEventService specialEventService;
    private final TaskService taskService;

    public SpecialEventController(SpecialEventService specialEventService, TaskService taskService) {
        this.specialEventService = specialEventService;
        this.taskService = taskService;
    }

    // 1. Pobierz wszystkie wydarzenia
    @GetMapping
    public List<SpecialEventDTO> getAllEvents() {
        return specialEventService.getAllEvents().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // --- TEJ METODY BRAKOWAŁO (Naprawia błąd 405 przy wejściu w edycję) ---
    @GetMapping("/{id}")
    public SpecialEventDTO getEvent(@PathVariable Long id) {
        SpecialEvent event = specialEventService.getEvent(id);
        return convertToDTO(event);
    }

    // 2. Stwórz nowe (puste) wydarzenie
    @PostMapping
    public SpecialEventDTO createEvent(@RequestBody SpecialEventDTO dto) {
        SpecialEvent event = new SpecialEvent();
        event.setName(dto.name());
        event.setStartDate(dto.startDate());
        event.setEndDate(dto.endDate());

        SpecialEvent saved = specialEventService.createEvent(event);
        return convertToDTO(saved);
    }

    // --- TEJ METODY TEŻ PEWNIE BRAKUJE (Naprawia zapisywanie edycji) ---
    @PutMapping
    public SpecialEventDTO updateEvent(@RequestBody SpecialEventDTO dto) {
        if (dto.id() == null) throw new IllegalArgumentException("ID is required for update");

        SpecialEvent event = specialEventService.getEvent(dto.id());
        event.setName(dto.name());
        event.setStartDate(dto.startDate());
        event.setEndDate(dto.endDate());

        SpecialEvent saved = specialEventService.createEvent(event); // save działa jak update
        return convertToDTO(saved);
    }

    // 3. Usuń wydarzenie (kaskadowo usunie zadania)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        specialEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // 4. Klonowanie wydarzenia (Deep Copy)
    @PostMapping("/{id}/clone")
    public SpecialEventDTO cloneEvent(@PathVariable Long id, @RequestBody CloneEventRequest request) {
        SpecialEvent cloned = specialEventService.cloneEvent(
                id,
                request.newName(),
                request.newStartDate(),
                request.newEndDate()
        );
        return convertToDTO(cloned);
    }

    // 5. Zadania wewnątrz konkretnego wydarzenia
    @GetMapping("/{id}/tasks")
    public List<Task> getTasksForEvent(@PathVariable Long id) {
        return taskService.getTasksByEventId(id);
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<Void> addTaskToEvent(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        taskService.saveTaskForEvent(taskDTO, id);
        return ResponseEntity.ok().build();
    }

    // Helper
    private SpecialEventDTO convertToDTO(SpecialEvent event) {
        return new SpecialEventDTO(
                event.getId(),
                event.getName(),
                event.getStartDate(),
                event.getEndDate()
        );
    }

    @GetMapping("/active")
    public SpecialEventDTO getActiveEventForDate(@RequestParam LocalDate date) {
        // Zakładam, że masz metodę w repozytorium: findEventsActiveOnDate(date)
        // Jeśli zwraca listę, bierzemy pierwszy (zakładamy brak nakładania się eventów)
        return specialEventService.findEventsActiveOnDate(date).stream()
                .findFirst()
                .map(this::convertToDTO)
                .orElse(null); // Zwraca null (200 OK), jeśli brak eventu
    }
}