package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.domain.Wish;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WishRepository extends JpaRepository<Wish, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT w FROM Wish w
            WHERE w.isSent = false
              AND w.isLetter = false
            ORDER BY w.id ASC
            """)
    List<Wish> findUnsentEmailWishesForUpdate();

    List<Wish> findAllByOrderByIdAsc();

    long countByUser_Id(Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Wish w
            SET w.user = :user
            WHERE w.id = :wishId
              AND w.user IS NULL
            """)
    int claimIfUnassigned(
            @Param("wishId") Long wishId,
            @Param("user") User user
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        UPDATE Wish w
        SET w.message = null,
            w.isSent = false,
            w.user = null
        """)
    int resetAllWishes();
}