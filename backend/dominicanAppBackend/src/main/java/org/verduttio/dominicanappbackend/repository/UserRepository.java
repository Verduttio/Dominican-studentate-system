package org.verduttio.dominicanappbackend.repository;

import jakarta.annotation.Nonnull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.dto.UserShortInfo;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsById(@Nonnull Long id);

    @Query("SELECT new org.verduttio.dominicanappbackend.dto.UserShortInfo(u.id, u.name, u.surname) FROM User u")
    List<UserShortInfo> findAllUsersShortInfo();
}
