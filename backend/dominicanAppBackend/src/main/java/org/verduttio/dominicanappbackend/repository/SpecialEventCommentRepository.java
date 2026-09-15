package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.verduttio.dominicanappbackend.domain.SpecialEventComment;
import org.verduttio.dominicanappbackend.domain.TaskSection;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialEventCommentRepository extends JpaRepository<SpecialEventComment, Long> {

    Optional<SpecialEventComment> findBySpecialEventIdAndRoleNameAndDateAndTaskSection(Long eventId, String roleName, LocalDate date, TaskSection taskSection);

    Optional<SpecialEventComment> findBySpecialEventIdAndRoleNameAndDateAndTaskSectionIsNull(Long eventId, String roleName, LocalDate date);

    List<SpecialEventComment> findAllBySpecialEventIdAndRoleNameAndDate(Long eventId, String roleName, LocalDate date);

    // Potrzebne do klonowania całego wydarzenia
    List<SpecialEventComment> findAllBySpecialEventId(Long eventId);
}