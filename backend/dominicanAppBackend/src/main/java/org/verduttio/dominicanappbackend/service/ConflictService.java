package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.service.exception.ConflictAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.ConflictIdNotFoundException;
import org.verduttio.dominicanappbackend.dto.ConflictDTO;
import org.verduttio.dominicanappbackend.entity.Conflict;
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

        validateConflictFields(conflict);

        conflictRepository.save(conflict);
    }

    public void saveConflict(Conflict conflict) {
        conflictRepository.save(conflict);
    }

    public void deleteConflict(Long conflictId) {
        conflictRepository.deleteById(conflictId);
    }

    public void updateConflict(Long conflictId, ConflictDTO updatedConflictDTO) {
        Conflict conflict = updatedConflictDTO.onlyIdFieldsToConflict();
        conflict.setId(conflictId);

        validateConflictFields(conflict);

        conflictRepository.save(conflict);
    }

    public boolean existsById(Long conflictId) {
        return conflictRepository.existsById(conflictId);
    }

    private void validateConflictFields(Conflict conflict) {
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
