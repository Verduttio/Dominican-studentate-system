package org.verduttio.dominicanappbackend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.dto.task.TaskShortInfo;
import org.verduttio.dominicanappbackend.entity.Task;

import java.util.List;
import java.util.Optional;


public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByName(String name);

    @Query("SELECT t FROM Task t JOIN t.allowedRoles r WHERE r.name IN :roleName")
    List<Task> findTaskByRoleName(String roleName);

    @Query("SELECT new org.verduttio.dominicanappbackend.dto.task.TaskShortInfo(t.id, t.name) FROM Task t")
    List<TaskShortInfo> findAllTasksShortInfo();

    @Query("SELECT t FROM Task t WHERE t.supervisorRole.name = :supervisorName")
    List<Task> findTasksBySupervisorRoleName(String supervisorName);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM task_allowed_roles WHERE role_id = :roleId", nativeQuery = true)
    void removeRoleFromAllTasks(@Param("roleId") Long roleId);
}
