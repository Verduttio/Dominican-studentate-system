package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.verduttio.dominicanappbackend.entity.Task;

import java.util.List;
import java.util.Optional;


public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByName(String name);

    @Query("SELECT t FROM Task t JOIN t.allowedRoles r WHERE r.name IN :roleName")
    List<Task> findTaskByRoleName(String roleName);
}
