package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.SpecialDate;
import org.verduttio.dominicanappbackend.entity.SpecialDateType;
import org.verduttio.dominicanappbackend.repository.SpecialDateRepository;

import java.time.LocalDate;

@Service
public class SpecialDateService {
    private final SpecialDateRepository specialDateRepository;

    @Autowired
    public SpecialDateService(SpecialDateRepository specialDateRepository) {
        this.specialDateRepository = specialDateRepository;
    }

    public SpecialDate getStatsDate() {
        return specialDateRepository.findByType(SpecialDateType.STATS);
    }

    public void updateStatsDate(LocalDate newDate) {
        if (newDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("New date cannot be from future.");
        }

        SpecialDate specialDate = specialDateRepository.findByType(SpecialDateType.STATS);
        specialDate.setDate(newDate);
        specialDateRepository.save(specialDate);
    }
}
