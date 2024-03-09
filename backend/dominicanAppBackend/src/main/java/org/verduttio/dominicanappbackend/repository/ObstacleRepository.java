package org.verduttio.dominicanappbackend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;

import java.util.List;


public interface ObstacleRepository extends JpaRepository<Obstacle, Long> {
    @Query("SELECT o FROM Obstacle o JOIN o.tasks t WHERE o.user.id = :userId AND t.id = :taskId")
    List<Obstacle> findObstaclesByUserIdAndTaskId(@Param("userId") Long userId, @Param("taskId") Long taskId);

    List<Obstacle> findAllByUserId(Long userId);


    @Query("SELECT o FROM Obstacle o JOIN o.tasks t WHERE t.id = :taskId")
    List<Obstacle> findAllByTaskId(Long taskId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Obstacle o WHERE o.id IN (SELECT o.id FROM Obstacle o JOIN o.tasks t WHERE t.id = :taskId)")
    void deleteAllByTaskId(Long taskId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Obstacle o WHERE o.user.id = :userId")
    void deleteAllByApplicantUserId(Long userId);

    @Transactional
    @Modifying
    @Query("UPDATE Obstacle o SET o.recipientUser = NULL WHERE o.recipientUser.id = :userId")
    void updateAllByRecipientUserIdToNull(Long userId);

    Long countAllByStatus(ObstacleStatus status);
}
