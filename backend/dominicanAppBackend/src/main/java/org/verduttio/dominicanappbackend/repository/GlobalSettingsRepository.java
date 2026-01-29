package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.domain.GlobalSettings;
import java.util.Optional;

public interface GlobalSettingsRepository extends JpaRepository<GlobalSettings, Long> {
    Optional<GlobalSettings> findByKey(String key);
}