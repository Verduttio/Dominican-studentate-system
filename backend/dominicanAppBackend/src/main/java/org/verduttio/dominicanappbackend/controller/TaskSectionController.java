package org.verduttio.dominicanappbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.verduttio.dominicanappbackend.domain.TaskSection;
import org.verduttio.dominicanappbackend.repository.TaskSectionRepository;

import java.util.List;

@RestController
@RequestMapping("/api/task-sections")
public class TaskSectionController {

    private final TaskSectionRepository taskSectionRepository;

    public TaskSectionController(TaskSectionRepository taskSectionRepository) {
        this.taskSectionRepository = taskSectionRepository;
    }

    // Dostępne dla każdego zalogowanego użytkownika (bracia też będą tego potrzebować przy zgłaszaniu przeszkód)
    @GetMapping
    public ResponseEntity<List<TaskSection>> getAllTaskSections() {
        // Zwracamy wszystkie sekcje (można ewentualnie posortować po ID, żeby "Rano" zawsze było pierwsze)
        return ResponseEntity.ok(taskSectionRepository.findAll());
    }
}