package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.Conflict;


public interface ConflictRepository extends JpaRepository<Conflict, Long> {
}
