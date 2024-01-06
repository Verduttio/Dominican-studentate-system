package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.Schedule;

import java.util.List;


public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUserId(Long userId);
}
