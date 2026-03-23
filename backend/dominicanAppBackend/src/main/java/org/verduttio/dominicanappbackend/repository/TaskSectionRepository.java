package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.verduttio.dominicanappbackend.domain.TaskSection;

@Repository
public interface TaskSectionRepository extends JpaRepository<TaskSection, Long> {
    java.util.Optional<TaskSection> findByName(String name);
}