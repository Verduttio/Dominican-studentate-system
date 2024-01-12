package org.verduttio.dominicanappbackend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.service.exception.ConflictAlreadyExistsException;
import org.verduttio.dominicanappbackend.service.exception.ConflictIdNotFoundException;
import org.verduttio.dominicanappbackend.dto.ConflictDTO;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.service.ConflictService;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/conflicts")
public class ConflictController {

    private final ConflictService conflictService;

    @Autowired
    public ConflictController(ConflictService conflictService) {
        this.conflictService = conflictService;
    }

    @GetMapping
    public ResponseEntity<List<Conflict>> getAllConflicts() {
        List<Conflict> conflicts = conflictService.getAllConflicts();
        return new ResponseEntity<>(conflicts, HttpStatus.OK);
    }

    @GetMapping("/{conflictId}")
    public ResponseEntity<Conflict> getConflictById(@PathVariable Long conflictId) {
        Optional<Conflict> conflict = conflictService.getConflictById(conflictId);
        return conflict.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<?> createConflict(@Valid @RequestBody ConflictDTO conflictDTO) {
        try {
            conflictService.saveConflict(conflictDTO);
        } catch (ConflictIdNotFoundException | ConflictAlreadyExistsException | TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{conflictId}")
    public ResponseEntity<?> updateConflict(@PathVariable Long conflictId, @Valid @RequestBody ConflictDTO updatedConflictDTO) {
        boolean conflictExist = conflictService.existsById(conflictId);
        if (conflictExist) {
            return updateConflictIfExists(conflictId, updatedConflictDTO);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{conflictId}")
    public ResponseEntity<Void> deleteConflict(@PathVariable Long conflictId) {
        conflictService.deleteConflict(conflictId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private ResponseEntity<?> updateConflictIfExists(Long conflictId, ConflictDTO updatedConflictDTO) {
        try {
            conflictService.updateConflict(conflictId, updatedConflictDTO);
        } catch (ConflictIdNotFoundException | ConflictAlreadyExistsException | TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
