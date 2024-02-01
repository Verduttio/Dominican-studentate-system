package org.verduttio.dominicanappbackend.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.dto.ObstaclePatchDTO;
import org.verduttio.dominicanappbackend.dto.ObstacleRequestDTO;
import org.verduttio.dominicanappbackend.entity.ObstacleStatus;
import org.verduttio.dominicanappbackend.repository.TaskRepository;
import org.verduttio.dominicanappbackend.service.UserService;
import org.verduttio.dominicanappbackend.service.exception.EntityNotFoundException;

import java.time.LocalDate;

@Component
public class ObstacleValidator {

    private final DateValidator dateValidator;
    private final UserService userService;
    private final TaskRepository taskRepository;

    @Autowired
    public ObstacleValidator(DateValidator dateValidator, UserService userService, TaskRepository taskRepository) {
        this.dateValidator = dateValidator;
        this.userService = userService;
        this.taskRepository = taskRepository;
    }

    public void validateObstacleRequestDTO(ObstacleRequestDTO obstacleRequestDTO) {
        Long userId = obstacleRequestDTO.getUserId();
        Long taskId = obstacleRequestDTO.getTaskId();

        if (!userService.existsById(userId)) {
            throw new EntityNotFoundException("User with id " + userId + " does not exist");
        }

        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task with id " + taskId + " does not exist");
        }
    }

    public void ensureFromDateNotAfterToDate(LocalDate fromDate, LocalDate toDate) {
        dateValidator.ensureFromDateNotAfterToDate(fromDate, toDate);
    }

    public boolean isDateInRange(LocalDate date, LocalDate fromDate, LocalDate toDate) {
        return dateValidator.isDateInRange(date, fromDate, toDate);
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
