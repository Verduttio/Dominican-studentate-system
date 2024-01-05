package org.verduttio.dominicanappbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.verduttio.dominicanappbackend.dto.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.entity.Obstacle;
import org.verduttio.dominicanappbackend.repository.ObstacleRepository;
import org.verduttio.dominicanappbackend.service.exception.TaskNotFoundException;
import org.verduttio.dominicanappbackend.service.exception.UserNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ObstacleService {

    private final ObstacleRepository obstacleRepository;
    private final UserService userService;
    private final TaskService taskService;

    @Autowired
    public ObstacleService(ObstacleRepository obstacleRepository, UserService userService, TaskService taskService) {
        this.obstacleRepository = obstacleRepository;
        this.userService = userService;
        this.taskService = taskService;
    }

    public List<Obstacle> getAllObstacles() {
        return obstacleRepository.findAll();
    }

    public Optional<Obstacle> getObstacleById(Long obstacleId) {
        return obstacleRepository.findById(obstacleId);
    }

    public void saveObstacle(ObstacleRequestDTO obstacleRequestDTO) {
        validateObstacleRequestDTO(obstacleRequestDTO);
        validateDates(obstacleRequestDTO.getFromDate(), obstacleRequestDTO.getToDate());

        Obstacle obstacle = obstacleRequestDTO.toObstacle();
        obstacleRepository.save(obstacle);
    }

    public void deleteObstacle(Long obstacleId) {
        obstacleRepository.deleteById(obstacleId);
    }

    private void validateObstacleRequestDTO(ObstacleRequestDTO obstacleRequestDTO) {
        Long userId = obstacleRequestDTO.getUserId();
        Long taskId = obstacleRequestDTO.getTaskId();

        if (!userService.existsById(userId)) {
            throw new UserNotFoundException("User with id " + userId + " does not exist");
        }

        if (!taskService.existsById(taskId)) {
            throw new TaskNotFoundException("Task with id " + taskId + " does not exist");
        }
    }

    private void validateDates(LocalDate fromDate, LocalDate toDate) {
        if(!(fromDate.isBefore(toDate) || fromDate.isEqual(toDate))) {
            throw new IllegalArgumentException("Invalid dates. 'fromDate' must be before or equal to 'toDate'");
        }
    }
}
