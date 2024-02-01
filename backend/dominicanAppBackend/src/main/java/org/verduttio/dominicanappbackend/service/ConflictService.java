package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.ConflictDTO;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;
import org.verduttio.dominicanappbackend.validation.ConflictValidator;

import java.util.List;
import java.util.Optional;

@Service
public class ConflictService {

    private final ConflictRepository conflictRepository;
    private final ConflictValidator conflictValidator;

    @Autowired
    public ConflictService(ConflictRepository conflictRepository,
                           ConflictValidator conflictValidator) {
        this.conflictRepository = conflictRepository;
        this.conflictValidator = conflictValidator;
    }

    public List<Conflict> getAllConflicts() {
        return conflictRepository.findAll();
    }

    public Optional<Conflict> getConflictById(Long conflictId) {
        return conflictRepository.findById(conflictId);
    }

    public void saveConflict(ConflictDTO conflictDTO) {
        Conflict conflict = conflictDTO.onlyIdFieldsToConflict();
        conflictValidator.validateConflictFields(conflict);
        conflictRepository.save(conflict);
    }

    public void saveConflict(Conflict conflict) {
        conflictRepository.save(conflict);
    }

    public void deleteConflict(Long conflictId) {
        conflictValidator.checkIfConflictExists(conflictId);
        conflictRepository.deleteById(conflictId);
    }

    public boolean tasksAreInConflict(Long task1Id, Long task2Id) {
        return conflictRepository.existsByTaskIds(task1Id, task2Id);
    }

    public void updateConflict(Long conflictId, ConflictDTO updatedConflictDTO) {
        Conflict conflict = updatedConflictDTO.onlyIdFieldsToConflict();
        conflict.setId(conflictId);
        conflictValidator.validateConflictFields(conflict);
        conflictRepository.save(conflict);
    }

    public boolean existsById(Long conflictId) {
        return conflictRepository.existsById(conflictId);
    }

    public void deleteAllConflictsByTaskId(Long taskId) {
        conflictRepository.deleteAllByTaskId(taskId);
    }
}
