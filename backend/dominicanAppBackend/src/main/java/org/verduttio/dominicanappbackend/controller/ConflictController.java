package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.dto.ConflictDTO;
import org.verduttio.dominicanappbackend.entity.Conflict;
import org.verduttio.dominicanappbackend.service.ConflictService;

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
    public ResponseEntity<?> createConflict(@RequestBody ConflictDTO conflictDTO) {
        boolean actionResult = conflictService.saveConflict(conflictDTO);
        if (actionResult) {
            return new ResponseEntity<>(HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("Tasks' id not found", HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @PutMapping("/{conflictId}")
    public ResponseEntity<?> updateConflict(@PathVariable Long conflictId, @RequestBody ConflictDTO updatedConflictDTO) {
        Optional<Conflict> existingConflict = conflictService.getConflictById(conflictId);
        if (existingConflict.isPresent()) {
            Optional<Conflict> updatedConflictDB = conflictService.updateConflict(existingConflict.get(), updatedConflictDTO);

            if (updatedConflictDB.isEmpty()) {
                return new ResponseEntity<>("Tasks' id not found", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            else {
                return new ResponseEntity<>(updatedConflictDB, HttpStatus.OK);
            }

        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{conflictId}")
    public ResponseEntity<Void> deleteConflict(@PathVariable Long conflictId) {
        conflictService.deleteConflict(conflictId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
