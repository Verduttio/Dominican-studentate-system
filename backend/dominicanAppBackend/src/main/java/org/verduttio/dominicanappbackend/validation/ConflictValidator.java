package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.exception.EntityAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.SameTasksForConflictException;

@Component
public class ConflictValidator {

    private final TaskRepository taskRepository;

    private final ConflictRepository conflictRepository;

    @Autowired
    public ConflictValidator(TaskRepository taskRepository, ConflictRepository conflictRepository) {
        this.taskRepository = taskRepository;
        this.conflictRepository = conflictRepository;
    }

    public void validateConflictFieldsOnAdd(Conflict conflict) {
        Long task1Id = conflict.getTask1().getId();
        Long task2Id = conflict.getTask2().getId();

        checkDifferentTaskIds(task1Id, task2Id);

        checkTaskExistence(task1Id);
        checkTaskExistence(task2Id);

        checkConflictWithGivenTaskIdsExists(task1Id, task2Id);
    }

    public void validateConflictFieldsOnUpdate(Conflict conflict) {
        Long task1Id = conflict.getTask1().getId();
        Long task2Id = conflict.getTask2().getId();

        checkDifferentTaskIds(task1Id, task2Id);

        checkTaskExistence(task1Id);
        checkTaskExistence(task2Id);

        checkIfOtherSameConflictExistsOnUpdate(conflict);
    }

    private void checkDifferentTaskIds(Long task1Id, Long task2Id) {
        if (task1Id.equals(task2Id)) {
            throw new SameTasksForConflictException("Task cannot be in conflict with itself");
        }
    }

    public void checkIfConflictExists(Long conflictId) {
        if (!conflictRepository.existsById(conflictId)) {
            throw new EntityNotFoundException("Conflict with id " + conflictId + " not found");
        }
    }

    private void checkTaskExistence(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task with id " + taskId + " not found");
        }
    }

    private void checkConflictWithGivenTaskIdsExists(Long task1Id, Long task2Id) {
        if (conflictRepository.existsByTaskIds(task1Id, task2Id)) {
            throw new EntityAlreadyExistsException("Conflict with given task ids already exist");
        }
    }

    private void checkIfOtherSameConflictExistsOnUpdate(Conflict updatedConflict) {
        Conflict oldConflict = conflictRepository.findById(updatedConflict.getId()).orElseThrow(() -> new EntityNotFoundException("Conflict with id " + updatedConflict.getId() + " not found"));
        Long oldConflictTask1Id = oldConflict.getTask1().getId();
        Long oldConflictTask2Id = oldConflict.getTask2().getId();

        Long updatedConflictTask1Id = updatedConflict.getTask1().getId();
        Long updatedConflictTask2Id = updatedConflict.getTask2().getId();

        if((oldConflictTask1Id.equals(updatedConflictTask1Id) && oldConflictTask2Id.equals(updatedConflictTask2Id))
        || (oldConflictTask1Id.equals(updatedConflictTask2Id) && oldConflictTask2Id.equals(updatedConflictTask1Id))) {
        } else {
            checkConflictWithGivenTaskIdsExists(updatedConflictTask1Id, updatedConflictTask2Id);
        }
    }
}
