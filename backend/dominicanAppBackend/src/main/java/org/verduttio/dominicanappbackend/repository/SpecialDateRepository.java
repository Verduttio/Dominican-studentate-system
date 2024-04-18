package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.SpecialDate;
import org.verduttio.dominicanappbackend.entity.SpecialDateType;

public interface SpecialDateRepository extends JpaRepository<SpecialDate, Long>{
    SpecialDate findByType(SpecialDateType type);
}
