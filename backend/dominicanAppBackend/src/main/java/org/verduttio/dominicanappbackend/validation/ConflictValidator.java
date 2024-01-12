package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.exception.ConflictAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.ConflictIdNotFoundException;

@Component
public class ConflictValidator {

    private final TaskService taskService;

    private final ConflictRepository conflictRepository;

    @Autowired
    public ConflictValidator(TaskService taskService, ConflictRepository conflictRepository) {
        this.taskService = taskService;
        this.conflictRepository = conflictRepository;
    }

    public void validateConflictFields(Conflict conflict) {
        Long task1Id = conflict.getTask1().getId();
        Long task2Id = conflict.getTask2().getId();
        boolean task1Exists = taskService.taskExistsById(task1Id);
        boolean task2Exists = taskService.taskExistsById(task2Id);
        if (!task1Exists || !task2Exists) {
            throw new ConflictIdNotFoundException("Tasks' id not found");
        }

        if (conflictRepository.existsByTaskIds(task1Id, task2Id)) {
            throw new ConflictAlreadyExistsException("Conflict with given tasks already exists");
        }
    }
}
