package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.verduttio.dominicanappbackend.domain.SpecialDate;
import org.verduttio.dominicanappbackend.service.SpecialDateService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dates")
public class SpecialDateController {
    private final SpecialDateService specialDateService;

    @Autowired
    public SpecialDateController(SpecialDateService specialDateService) {
        this.specialDateService = specialDateService;
    }

    @GetMapping("/stats")
    public ResponseEntity<SpecialDate> getStatsDate() {
        SpecialDate specialDate = specialDateService.getStatsDate();
        return new ResponseEntity<>(specialDate, HttpStatus.OK);
    }

    @GetMapping("/pageable/feast")
    public ResponseEntity<Page<SpecialDate>> getFeastDates(Pageable pageable) {
        Page<SpecialDate> specialDate = specialDateService.getFeastDates(pageable);
        return new ResponseEntity<>(specialDate, HttpStatus.OK);
    }

    @PostMapping("/feast")
    public ResponseEntity<?> createFeastDate(@RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate date) {
        specialDateService.createFeastDate(date);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/stats")
    public ResponseEntity<?> updateStatsDate(@RequestParam("date") @DateTimeFormat(pattern = "dd-MM-yyyy") LocalDate newDate) {
        try {
            specialDateService.updateStatsDate(newDate);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/feast/{id}")
    public ResponseEntity<?> deleteFeastDate(@PathVariable Long id) {
        specialDateService.deleteFeastDate(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
