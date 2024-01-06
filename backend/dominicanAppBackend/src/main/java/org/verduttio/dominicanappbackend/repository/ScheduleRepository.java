package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.entity.Schedule;

import java.time.LocalDate;
import java.util.List;


public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUserId(Long userId);

    @Query("SELECT s FROM Schedule s WHERE s.date >= :targetDate")
    List<Schedule> findSchedulesLaterOrInDay(@Param("targetDate") LocalDate targetDate);
}
