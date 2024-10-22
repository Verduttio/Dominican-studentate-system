package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.domain.SpecialDate;
import org.verduttio.dominicanappbackend.domain.SpecialDateType;

import java.time.LocalDate;
import java.util.List;

public interface SpecialDateRepository extends JpaRepository<SpecialDate, Long>{
    boolean existsByTypeAndDate(SpecialDateType type, LocalDate date);
    boolean existsByTypeAndDateBetween(SpecialDateType type, LocalDate from, LocalDate to);
    List<SpecialDate> findByType(SpecialDateType type);
    Page<SpecialDate> findByType(SpecialDateType type, Pageable pageable);
    List<SpecialDate> findByTypeAndDateBetween(SpecialDateType type, LocalDate date, LocalDate date2);
}
