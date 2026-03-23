package org.verduttio.dominicanappbackend.repository;

import jakarta.annotation.Nonnull;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.domain.Conflict;
import org.verduttio.dominicanappbackend.domain.Task;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;


public interface ConflictRepository extends JpaRepository<Conflict, Long> {
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Conflict c WHERE ((c.task1.id = :taskId1 AND c.task2.id = :taskId2) OR (c.task1.id = :taskId2 AND c.task2.id = :taskId1))")
    boolean existsByTaskIds(@Param("taskId1") Long taskId1, @Param("taskId2") Long taskId2);

    boolean existsById(@Nonnull Long id);

    @Transactional
    @Modifying
    @Query("DELETE FROM Conflict c WHERE c.task1.id = :taskId OR c.task2.id = :taskId")
    void deleteAllByTaskId(Long taskId);

    @Transactional
    @Query("SELECT c FROM Conflict c WHERE c.task1.id = :taskId OR c.task2.id = :taskId")
    List<Conflict> findAllByTaskId(Long taskId);

    @Transactional
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Conflict c WHERE ((c.task1.id = :task1Id AND c.task2.id = :task2Id) OR (c.task1.id = :task2Id AND c.task2.id = :task1Id)) AND :dayOfWeek MEMBER OF c.daysOfWeek")
    boolean existsByTaskIdsAndDayOfWeek(Long task1Id, Long task2Id, DayOfWeek dayOfWeek);

    @Query("SELECT c FROM Conflict c WHERE c.task1 = :task OR c.task2 = :task")
    Set<Conflict> findByTask(@Param("task") Task task);
}
