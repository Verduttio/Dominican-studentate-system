package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.controller.exception.ConflictAlreadyExistsException;
import org.verduttio.dominicanappbackend.controller.exception.ConflictIdNotFoundException;
import org.verduttio.dominicanappbackend.dto.ConflictDTO;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.entity.Task;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ConflictService {

    private final ConflictRepository conflictRepository;
    private final TaskService taskService;

    @Autowired
    public ConflictService(ConflictRepository conflictRepository, TaskService taskService) {
        this.conflictRepository = conflictRepository;
        this.taskService = taskService;
    }

    public List<Conflict> getAllConflicts() {
        return conflictRepository.findAll();
    }

    public Optional<Conflict> getConflictById(Long conflictId) {
        return conflictRepository.findById(conflictId);
    }

    public void saveConflict(ConflictDTO conflictDTO) {
        Conflict conflict = conflictDTO.onlyIdFieldsToConflict();

        boolean task1Exists = taskService.taskExistsById(conflictDTO.getTask1Id());
        boolean task2Exists = taskService.taskExistsById(conflictDTO.getTask2Id());
        if (!task1Exists || !task2Exists) {
            throw new ConflictIdNotFoundException("Tasks' id not found");
        }

        if (conflictRepository.existsByTaskIds(conflictDTO.getTask1Id(), conflictDTO.getTask2Id())) {
            throw new ConflictAlreadyExistsException("Conflict with given tasks already exists");
        }

        conflictRepository.save(conflict);
    }

    public void saveConflict(Conflict conflict) {
        conflictRepository.save(conflict);
    }

    public void deleteConflict(Long conflictId) {
        conflictRepository.deleteById(conflictId);
    }

    public Optional<Conflict> updateConflict(Conflict conflict, ConflictDTO updatedConflictDTO) {
        Optional<Task> updatedTask1 = taskService.getTaskById(updatedConflictDTO.getTask1Id());
        if (updatedTask1.isEmpty()) return Optional.empty();

        Optional<Task> updatedTask2 = taskService.getTaskById(updatedConflictDTO.getTask2Id());
        if (updatedTask2.isEmpty()) return Optional.empty();

        conflict.setTask1(updatedTask1.get());
        conflict.setTask2(updatedTask2.get());

        conflictRepository.save(conflict);
        return Optional.of(conflict);
    }
}
