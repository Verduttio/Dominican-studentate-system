package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.repository.ConflictRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ConflictService {

    private final ConflictRepository conflictRepository;

    @Autowired
    public ConflictService(ConflictRepository conflictRepository) {
        this.conflictRepository = conflictRepository;
    }

    public List<Conflict> getAllConflicts() {
        return conflictRepository.findAll();
    }

    public Optional<Conflict> getConflictById(Long conflictId) {
        return conflictRepository.findById(conflictId);
    }

    public void saveConflict(Conflict conflict) {
        conflictRepository.save(conflict);
    }

    public void deleteConflict(Long conflictId) {
        conflictRepository.deleteById(conflictId);
    }

}
