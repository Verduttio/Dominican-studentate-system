package org.verduttio.dominicanappbackend.repository;

import jakarta.annotation.Nonnull;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.domain.User;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findAllByOrderByEntryDateAsc();

    List<User> findAllByOrderByEntryDateAsc(Sort isEnabled);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsById(@Nonnull Long id);

    @Query("SELECT new org.verduttio.dominicanappbackend.dto.user.UserShortInfo(u.id, u.name, u.surname) FROM User u ORDER BY u.entryDate ASC")
    List<UserShortInfo> findAllUsersShortInfo();

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_roles WHERE role_id = :roleId", nativeQuery = true)
    void removeRoleFromAllUsers(Long roleId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name IN :roleNames ORDER BY u.entryDate ASC")
    List<User> findAllWhichHaveAnyOfRoles(List<String> roleNames);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isEnabled = false")
    Long countByNotEnabled();
}
