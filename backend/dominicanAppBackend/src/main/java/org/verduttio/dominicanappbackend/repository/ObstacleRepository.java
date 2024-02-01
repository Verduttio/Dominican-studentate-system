package org.verduttio.dominicanappbackend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.entity.Obstacle;

import java.util.List;


public interface ObstacleRepository extends JpaRepository<Obstacle, Long> {
    @Query("SELECT o FROM Obstacle o WHERE o.user.id = :userId AND o.task.id = :taskId")
    List<Obstacle> findObstaclesByUserIdAndTaskId(@Param("userId") Long userId, @Param("taskId") Long taskId);

    List<Obstacle> findAllByUserId(Long userId);

    List<Obstacle> findAllByTaskId(Long taskId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Obstacle o WHERE o.task.id = :taskId")
    void deleteAllByTaskId(Long taskId);
}
