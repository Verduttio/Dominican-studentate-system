package org.verduttio.dominicanappbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.verduttio.dominicanappbackend.entity.SpecialDate;
import org.verduttio.dominicanappbackend.service.SpecialDateService;

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
}
