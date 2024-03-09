package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.obstacle.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.UserService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.time.LocalDate;
import java.util.Set;

@Component
public class ObstacleValidator {
    private final UserService userService;
    private final TaskRepository taskRepository;

    @Autowired
    public ObstacleValidator(UserService userService, TaskRepository taskRepository) {
        this.userService = userService;
        this.taskRepository = taskRepository;
    }

    public void validateObstacleRequestDTO(ObstacleRequestDTO obstacleRequestDTO) {
        Long userId = obstacleRequestDTO.getUserId();
        Set<Long> taskId = obstacleRequestDTO.getTasksIds();

        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with id " + userId + " does not exist");
        }

        for (Long id : taskId) {
            if (!taskRepository.existsById(id)) {
                throw new EntityNotFoundException("Task with id " + id + " does not exist");
            }
        }
    }

    public void ensureFromDateNotAfterToDate(LocalDate fromDate, LocalDate toDate) {
        DateValidator.ensureFromDateNotAfterToDate(fromDate, toDate);
    }

    public boolean isDateInRange(LocalDate date, LocalDate fromDate, LocalDate toDate) {
        return DateValidator.isDateInRange(date, fromDate, toDate);
    }

    public void validateObstacleStatus(String status) {
        for (ObstacleStatus validStatus : ObstacleStatus.values()) {
            if (validStatus.toString().equals(status)) {
                return;
            }
        }
        throw new IllegalArgumentException("Invalid obstacle status: " + status);
    }

    public void validateObstaclePatchDTO(ObstaclePatchDTO obstaclePatchDTO) {
        validateObstacleStatus(obstaclePatchDTO.getStatus());
        validateUserExistence(obstaclePatchDTO.getRecipientUserId());
    }

    public void validateUserExistence(Long userId) {
        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User not found with id: " + userId);
        }
    }

    public void validateTaskExistence(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found with id: " + taskId);
        }
    }
}
