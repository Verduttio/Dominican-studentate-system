package org.verduttio.dominicanappbackend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.entity.Schedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUserId(Long userId);

    List<Schedule> findByDateBetween(LocalDate from, LocalDate to);

    List<Schedule> findByTaskIdAndDateBetween(Long taskId, LocalDate from, LocalDate to);

    List<Schedule> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);

    List<Schedule> findByUserIdAndDate(Long userId, LocalDate date);

    @Query("SELECT s FROM Schedule s WHERE s.date >= :targetDate")
    List<Schedule> findSchedulesLaterOrInDay(@Param("targetDate") LocalDate targetDate);

    @Transactional
    @Modifying
    @Query("DELETE FROM Schedule s WHERE s.task.id = :taskId")
    void deleteAllByTaskId(Long taskId);

    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.user.id = :userId AND s.task.id = :taskId AND s.date BETWEEN :startDate AND :endDate")
    long countByUserIdAndTaskIdInLastNDays(@Param("userId") Long userId,
                                           @Param("taskId") Long taskId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT MAX(s.date) FROM Schedule s WHERE s.user.id = :userId AND s.task.id = :taskId AND s.date < :upToDate")
    Optional<LocalDate> findLatestTaskCompletionDateByUserIdAndTaskId(@Param("userId") Long userId,
                                                                      @Param("taskId") Long taskId,
                                                                      @Param("upToDate") LocalDate upToDate);

    @Transactional
    @Modifying
    @Query("DELETE FROM Schedule s WHERE s.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Transactional
    void deleteAllByUserIdAndTaskIdAndDateBetween(Long userId, Long taskId, LocalDate fromDate, LocalDate toDate);
}
