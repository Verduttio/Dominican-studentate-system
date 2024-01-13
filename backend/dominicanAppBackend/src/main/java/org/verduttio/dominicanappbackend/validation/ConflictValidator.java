package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.service.TaskService;
import org.verduttio.dominicanappbackend.service.exception.ConflictAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;

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

        checkTaskExistence(task1Id);
        checkTaskExistence(task2Id);

        checkConflictWithGivenTaskIdsExists(task1Id, task2Id);
    }

    private void checkTaskExistence(Long taskId) {
        if (!taskService.taskExistsById(taskId)) {
            throw new TaskNotFoundException("Task with id " + taskId + " not found");
        }
    }

    private void checkConflictWithGivenTaskIdsExists(Long task1Id, Long task2Id) {
        if (conflictRepository.existsByTaskIds(task1Id, task2Id)) {
            throw new ConflictAlreadyExistsException("Conflict with given task ids already exist");
        }
    }
}
