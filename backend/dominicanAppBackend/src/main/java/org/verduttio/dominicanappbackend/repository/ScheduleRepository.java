package org.verduttio.dominicanappbackend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.domain.Schedule;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUserId(Long userId);

    List<Schedule> findByDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(LocalDate from, LocalDate to);

    List<Schedule> findByTaskIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(Long taskId, LocalDate from, LocalDate to);

    List<Schedule> findByUserIdAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(
            Long userId, LocalDate from, LocalDate to);

    List<Schedule> findByUserIdAndDateOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(Long userId, LocalDate date);

    List<Schedule> findByTaskId(Long taskId);

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

    // 1. Pobierz grafiki dla wielu użytkowników w danym zakresie (do wyświetlania kolizji i "Pn, Wt")
    List<Schedule> findByUserIdInAndDateBetweenOrderByTask_SupervisorRole_SortOrderAscTask_SortOrderAsc(List<Long> userIds, LocalDate from, LocalDate to);

    // 2. Pobierz statystyki (licznik i ostatnia data) HURTOWO
    // Zwraca listę tablic: [userId, taskId, count, maxDate]
    @Query("SELECT s.user.id, s.task.id, COUNT(s), MAX(s.date) " +
            "FROM Schedule s " +
            "WHERE s.user.id IN :userIds AND s.date >= :statsDate " +
            "GROUP BY s.user.id, s.task.id")
    List<Object[]> findStatsForUsersSinceDate(@Param("userIds") List<Long> userIds, @Param("statsDate") LocalDate statsDate);

    @Transactional
    @Modifying
    @Query("DELETE FROM Schedule s WHERE s.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Transactional
    void deleteAllByUserIdAndTaskIdAndDateBetween(Long userId, Long taskId, LocalDate fromDate, LocalDate toDate);
}
