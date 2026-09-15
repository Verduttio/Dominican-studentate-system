package org.verduttio.dominicanappbackend.controller;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.TaskSection;
import org.verduttio.dominicanappbackend.repository.TaskSectionRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/task-sections")
public class TaskSectionController {

    private final TaskSectionRepository taskSectionRepository;

    public TaskSectionController(TaskSectionRepository taskSectionRepository) {
        this.taskSectionRepository = taskSectionRepository;
    }

    // 1. ODCZYT: Dostępne dla każdego zalogowanego użytkownika
    @GetMapping
    public ResponseEntity<List<TaskSection>> getAllTaskSections() {
        // Zwracamy wszystkie sekcje sortując po ID, żeby "Rano" (ID 1) itp. zachowały swoją naturalną kolejność
        return ResponseEntity.ok(taskSectionRepository.findAll(Sort.by(Sort.Direction.ASC, "id")));
    }

    // 2. ZAPIS: Tworzenie nowej pory dnia (Tylko Admin/Dziekan)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEAN')")
    public ResponseEntity<TaskSection> createTaskSection(@RequestBody TaskSection taskSection) {
        if (taskSection.getName() == null || taskSection.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        TaskSection savedSection = taskSectionRepository.save(taskSection);
        return new ResponseEntity<>(savedSection, HttpStatus.CREATED);
    }

    // 3. EDYCJA: Zmiana nazwy (Tylko Admin/Dziekan)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEAN')")
    public ResponseEntity<TaskSection> updateTaskSection(@PathVariable Long id, @RequestBody TaskSection taskSectionDetails) {
        Optional<TaskSection> optionalSection = taskSectionRepository.findById(id);
        if (optionalSection.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (taskSectionDetails.getName() == null || taskSectionDetails.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        TaskSection section = optionalSection.get();
        section.setName(taskSectionDetails.getName());

        TaskSection updatedSection = taskSectionRepository.save(section);
        return ResponseEntity.ok(updatedSection);
    }

    // 4. USUWANIE (Tylko Admin/Dziekan)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEAN')")
    public ResponseEntity<Void> deleteTaskSection(@PathVariable Long id) {
        if (!taskSectionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            taskSectionRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Przechwytujemy błąd z bazy danych (np. DataIntegrityViolationException).
            // Dzieje się to, gdy próbujemy usunąć porę dnia, do której są już przypisane zadania.
            // Zwracamy 409 CONFLICT, co frontend ładnie zinterpretuje jako błąd.
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}