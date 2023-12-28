package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ObstacleService {

    private final ObstacleRepository obstacleRepository;

    @Autowired
    public ObstacleService(ObstacleRepository obstacleRepository) {
        this.obstacleRepository = obstacleRepository;
    }

    public List<Obstacle> getAllObstacles() {
        return obstacleRepository.findAll();
    }

    public Optional<Obstacle> getObstacleById(Long obstacleId) {
        return obstacleRepository.findById(obstacleId);
    }

    public void saveObstacle(Obstacle obstacle) {
        obstacleRepository.save(obstacle);
    }

    public void deleteObstacle(Long obstacleId) {
        obstacleRepository.deleteById(obstacleId);
    }

}
