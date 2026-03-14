package org.verduttio.dominicanappbackend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.dto.task.TaskShortInfo;
import org.verduttio.dominicanappbackend.domain.Task;

import java.util.List;
import java.util.Optional;


public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByName(String name);

    List<Task> findAllByOrderBySupervisorRole_SortOrderAscSortOrderAsc();

    @Query("SELECT t FROM Task t JOIN t.supervisorRole sr WHERE t.specialEvent IS NULL ORDER BY sr.sortOrder ASC, t.sortOrder ASC")
    List<Task> findAllTasksOrderBySupervisorRoleSortOrderAndTaskSortOrder();

    @Query("SELECT t FROM Task t JOIN t.allowedRoles r WHERE r.name IN :roleName AND t.specialEvent IS NULL ORDER BY t.sortOrder ASC")
    List<Task> findTaskByRoleName(String roleName);

    @Query("SELECT new org.verduttio.dominicanappbackend.dto.task.TaskShortInfo(t.id, t.name, t.nameAbbrev, t.supervisorRole.id) FROM Task t JOIN t.supervisorRole sr WHERE t.specialEvent IS NULL ORDER BY sr.sortOrder ASC, t.sortOrder ASC")
    List<TaskShortInfo> findAllTasksShortInfo();

    @Query("SELECT t FROM Task t WHERE t.supervisorRole.name = :supervisorName AND t.specialEvent IS NULL ORDER BY t.sortOrder ASC")
    List<Task> findTasksBySupervisorRoleName(String supervisorName);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM task_allowed_roles WHERE role_id = :roleId", nativeQuery = true)
    void removeRoleFromAllTasks(@Param("roleId") Long roleId);

    List<Task> findByVisibleInObstacleFormForUserRoleTrueOrderBySupervisorRole_SortOrderAscSortOrderAsc();

    long countBySupervisorRoleName(String supervisorRoleId);

    @Transactional
    @Modifying
    @Query("UPDATE Task t SET t.sortOrder = t.sortOrder - 1 WHERE t.sortOrder >= :sortOrder AND t.supervisorRole.id = :id AND t.specialEvent IS NULL")
    void decrementByRoleSortOrderGreaterThan(Long id, Long sortOrder);

    // Metoda potrzebna do pobierania zadań konkretnego eventu (np. do edycji eventu)
    @Query("SELECT t FROM Task t WHERE t.specialEvent.id = :eventId ORDER BY t.supervisorRole.sortOrder ASC, t.sortOrder ASC")
    List<Task> findAllBySpecialEventId(@Param("eventId") Long eventId);

    @Query("SELECT t FROM Task t WHERE t.specialEvent.id = :eventId AND t.supervisorRole.name = :roleName ORDER BY t.sortOrder ASC")
    List<Task> findAllBySpecialEventIdAndSupervisorRoleName(@Param("eventId") Long eventId, @Param("roleName") String roleName);

    List<Task> findTaskBySupervisorRole_Id(Long roleId);
}
