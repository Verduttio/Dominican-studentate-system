package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.entity.DocumentLink;

import java.util.List;

public interface DocumentLinkRepository extends JpaRepository<DocumentLink, Long> {
    List<DocumentLink> findAllByOrderBySortOrderAsc();

    @Modifying
    @Query("UPDATE DocumentLink dl SET dl.sortOrder = dl.sortOrder + 1 WHERE dl.sortOrder >= :sortOrder")
    void incrementSortOrderGreaterThanOrEqualTo(@Param("sortOrder") Long sortOrder);
}
