package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.Role;
import org.verduttio.dominicanappbackend.entity.RoleType;

import java.util.List;
import java.util.Optional;


public interface RoleRepository extends JpaRepository<Role, Long> {
    List<Role> findAllByOrderBySortOrderAsc();

    Optional<Role> findByName(String roleName);

    boolean existsByName(String roleName);

    List<Role> findByTypeOrderBySortOrderAsc(RoleType roleType);

    Optional<Role> findByNameAndType(String name, RoleType type);
}
