package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        return specialDateRepository.findByType(SpecialDateType.STATS).getFirst();
    }

    public void updateStatsDate(LocalDate newDate) {
        if (newDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("New date cannot be from future.");
        }

        SpecialDate specialDate = specialDateRepository.findByType(SpecialDateType.STATS).getFirst();
        specialDate.setDate(newDate);
        specialDateRepository.save(specialDate);
    }

    public Page<SpecialDate> getFeastDates(Pageable pageable) {
        return specialDateRepository.findByType(SpecialDateType.FEAST, pageable);
    }

    public void createFeastDate(LocalDate date) {
        SpecialDate specialDate = new SpecialDate();
        specialDate.setDate(date);
        specialDate.setType(SpecialDateType.FEAST);
        specialDateRepository.save(specialDate);
    }

    public void deleteFeastDate(Long id) {
        specialDateRepository.deleteById(id);
    }
}
