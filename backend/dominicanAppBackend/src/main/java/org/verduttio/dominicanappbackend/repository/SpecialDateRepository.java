package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.SpecialDate;
import org.verduttio.dominicanappbackend.entity.SpecialDateType;

import java.util.List;

public interface SpecialDateRepository extends JpaRepository<SpecialDate, Long>{
    List<SpecialDate> findByType(SpecialDateType type);
    Page<SpecialDate> findByType(SpecialDateType type, Pageable pageable);
}
