package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.domain.SpecialEvent;

import java.time.LocalDate;
import java.util.List;

public interface SpecialEventRepository extends JpaRepository<SpecialEvent, Long> {

    // Znajdź eventy, które "nachodzą" na daną datę
    @Query("SELECT e FROM SpecialEvent e WHERE :date >= e.startDate AND :date <= e.endDate")
    List<SpecialEvent> findEventsActiveOnDate(@Param("date") LocalDate date);

    // Znajdź eventy w zakresie dat (np. do kalendarza rocznego)
    @Query("SELECT e FROM SpecialEvent e WHERE e.startDate <= :rangeEnd AND e.endDate >= :rangeStart")
    List<SpecialEvent> findEventsInRange(@Param("rangeStart") LocalDate rangeStart, @Param("rangeEnd") LocalDate rangeEnd);
}