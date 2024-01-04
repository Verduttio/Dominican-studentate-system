package org.verduttio.dominicanappbackend.repository;

import jakarta.annotation.Nonnull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.entity.Conflict;


public interface ConflictRepository extends JpaRepository<Conflict, Long> {
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Conflict c WHERE (c.task1.id = :taskId1 AND c.task2.id = :taskId2) OR (c.task1.id = :taskId2 AND c.task2.id = :taskId1)")
    boolean existsByTaskIds(@Param("taskId1") Long taskId1, @Param("taskId2") Long taskId2);

    boolean existsById(@Nonnull Long id);
}
