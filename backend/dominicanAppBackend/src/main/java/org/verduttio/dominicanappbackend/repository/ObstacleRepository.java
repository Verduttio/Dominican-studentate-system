package org.verduttio.dominicanappbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.verduttio.dominicanappbackend.entity.Obstacle;


public interface ObstacleRepository extends JpaRepository<Obstacle, Long> {
}
