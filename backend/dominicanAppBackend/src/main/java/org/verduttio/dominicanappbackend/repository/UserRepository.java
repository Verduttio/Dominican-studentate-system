package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.User;


public interface UserRepository extends JpaRepository<User, Long> {
}
